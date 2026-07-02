(function attachBaseballData(global) {
  "use strict";

  const LEVELS = {
    mlb: [1],
    "all-pro": [1, 11, 12, 13, 14, 16],
    "all-milb": [11, 12, 13, 14, 16],
    "triple-a": [11],
    "double-a": [12],
    "high-a": [13],
    "single-a": [14],
    rookie: [16]
  };

  const MLB_ORIGIN = "https://statsapi.mlb.com";
  const LEGACY_RELAY = "https://baseballscorecardcreator.netlify.app/.netlify/functions/mlb";
  const REQUEST_TIMEOUT_MS = 15000;
  const MAX_PITCHERS = 15;

  function localDateISO(timeZone = "America/New_York", date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function timeLabel(dateTime) {
    if (!dateTime) return "Time TBA";
    const parsed = new Date(dateTime);
    if (Number.isNaN(parsed.getTime())) return "Time TBA";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(parsed);
  }

  function record(team) {
    const candidate = team?.record || team?.leagueRecord;
    if (!candidate || candidate.wins == null || candidate.losses == null) return "";
    return `${candidate.wins}-${candidate.losses}`;
  }

  function normalizeScheduleGame(game, sportId) {
    const away = game?.teams?.away?.team?.name || "Away";
    const home = game?.teams?.home?.team?.name || "Home";
    const status = game?.status?.detailedState || game?.status?.abstractGameState || "Scheduled";
    const venue = game?.venue?.name || "Venue TBA";
    return {
      gamePk: game?.gamePk,
      sportId,
      officialDate: game?.officialDate || "",
      awayTeam: away,
      homeTeam: home,
      status,
      venue,
      dateTime: game?.gameDate || "",
      label: `${away} at ${home} — ${timeLabel(game?.gameDate)} — ${venue} (${status})`
    };
  }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", ...(options.headers || {}) },
        signal: controller.signal,
        cache: "no-store"
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error("The baseball data service returned an unreadable response.");
      }
      if (payload?.error) throw new Error(payload.detail || payload.error);
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("The baseball data request timed out.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function sameOriginAvailable() {
    return typeof location !== "undefined" && /^https?:$/.test(location.protocol);
  }

  function sameOriginUrl(params) {
    const query = new URLSearchParams(params);
    return `/api/mlb?${query.toString()}`;
  }

  function relayUrl(endpoint) {
    return `${LEGACY_RELAY}?endpoint=${encodeURIComponent(endpoint)}`;
  }

  async function rawMlb(endpoint) {
    const errors = [];
    try {
      return { payload: await fetchJson(relayUrl(endpoint)), source: "online relay" };
    } catch (error) {
      errors.push(error);
    }
    try {
      return { payload: await fetchJson(`${MLB_ORIGIN}${endpoint}`), source: "direct MLB connection" };
    } catch (error) {
      errors.push(error);
    }
    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "Unable to reach the baseball data service.");
  }

  async function scheduleViaFallback(date, level) {
    const sports = LEVELS[level] || LEVELS.mlb;
    const settled = await Promise.allSettled(sports.map(async sportId => {
      const endpoint = `/api/v1/schedule?sportId=${sportId}&startDate=${encodeURIComponent(date)}&endDate=${encodeURIComponent(date)}&hydrate=team,venue,probablePitcher`;
      const result = await rawMlb(endpoint);
      const games = (result.payload?.dates || [])
        .flatMap(day => day?.games || [])
        .map(game => normalizeScheduleGame(game, sportId));
      return { games, source: result.source };
    }));

    const successful = settled.filter(result => result.status === "fulfilled").map(result => result.value);
    if (!successful.length) {
      const reasons = settled
        .filter(result => result.status === "rejected")
        .map(result => result.reason?.message)
        .filter(Boolean)
        .join("; ");
      throw new Error(reasons || "No schedule source responded.");
    }

    const games = successful
      .flatMap(result => result.games)
      .filter(game => game.gamePk)
      .sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)) || a.awayTeam.localeCompare(b.awayTeam));
    const source = [...new Set(successful.map(result => result.source))].join(" + ");
    return { date, level, games, source };
  }

  async function getSchedule(date, level = "mlb") {
    const errors = [];
    if (sameOriginAvailable()) {
      try {
        const payload = await fetchJson(sameOriginUrl({ action: "schedule", date, level }));
        if (!Array.isArray(payload?.games)) throw new Error("The app service returned an incomplete schedule.");
        return { ...payload, source: payload.source || "app data service" };
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      return await scheduleViaFallback(date, level);
    } catch (error) {
      errors.push(error);
    }

    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "The online baseball schedule is unavailable.");
  }

  function playerFromBox(boxTeam, id) {
    return boxTeam?.players?.[`ID${id}`] || null;
  }

  function seasonStat(person, groupName) {
    const groups = Array.isArray(person?.stats) ? person.stats : [];
    const match = groups.find(item => {
      const group = item?.group?.displayName || item?.group?.name || item?.group;
      return String(group || "").toLowerCase() === String(groupName).toLowerCase();
    });
    return match?.splits?.[0]?.stat || {};
  }

  function peopleLookup(payload) {
    return Object.fromEntries((payload?.people || []).filter(person => person?.id).map(person => [person.id, person]));
  }

  function rosterEntries(payload) {
    return Array.isArray(payload?.roster) ? payload.roster : [];
  }

  function rosterPersonIds(rosters = {}) {
    return [...new Set(["away", "home"].flatMap(side => rosterEntries(rosters?.[side]).map(entry => entry?.person?.id).filter(Boolean)))];
  }

  function teamIdForSide(feed, schedulePayload, side) {
    return feed?.gameData?.teams?.[side]?.id || schedulePayload?.dates?.[0]?.games?.[0]?.teams?.[side]?.team?.id || "";
  }

  function pitcherHand(value) {
    const code = String(value || "").trim().toUpperCase();
    if (!code) return "";
    return code.endsWith("HP") ? code : `${code}HP`;
  }

  function rosterEntryById(rosterPayload, id) {
    return rosterEntries(rosterPayload).find(entry => Number(entry?.person?.id) === Number(id)) || null;
  }

  function collectGamePersonIds(feed, schedulePayload, rosters = {}) {
    const box = feed?.liveData?.boxscore || {};
    const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const ids = [];
    for (const side of ["away", "home"]) {
      const team = box?.teams?.[side] || {};
      ids.push(...(team.battingOrder || []), ...(team.pitchers || []), ...Object.values(team.players || {}).map(entry => entry?.person?.id).filter(Boolean));
      const probable = scheduleGame?.teams?.[side]?.probablePitcher?.id;
      if (probable) ids.push(probable);
    }
    ids.push(...rosterPersonIds(rosters));
    return [...new Set(ids.filter(Boolean))];
  }

  function battingLineup(boxTeam, people = {}) {
    const order = Array.isArray(boxTeam?.battingOrder) ? boxTeam.battingOrder : [];
    return order.slice(0, 9).map(id => {
      const entry = playerFromBox(boxTeam, id) || {};
      const detail = people[id] || {};
      const person = entry.person || detail || {};
      const batting = entry.seasonStats?.batting || seasonStat(detail, "hitting") || {};
      return {
        id: id || person.id || detail.id || "",
        num: entry.jerseyNumber || detail.primaryNumber || "",
        name: person.fullName || detail.fullName || "",
        pos: entry.position?.abbreviation || detail.primaryPosition?.abbreviation || "",
        bats: entry.batSide?.code || detail.batSide?.code || "",
        avg: batting.avg || "",
        obp: batting.obp || ""
      };
    });
  }

  function benchList(boxTeam, people = {}, rosterPayload = {}) {
    const starters = new Set(Array.isArray(boxTeam?.battingOrder) ? boxTeam.battingOrder.map(Number) : []);
    const gamePitchers = new Set(Array.isArray(boxTeam?.pitchers) ? boxTeam.pitchers.map(Number) : []);
    const entries = new Map();
    Object.values(boxTeam?.players || {}).forEach(entry => { const id=Number(entry?.person?.id); if(id)entries.set(id,entry); });
    rosterEntries(rosterPayload).forEach(entry => { const id=Number(entry?.person?.id); if(id&&!entries.has(id))entries.set(id,entry); });
    return [...entries.entries()].map(([id,entry]) => {
      const detail = people[id] || {};
      const person = entry?.person || detail || {};
      const position = entry?.position || detail.primaryPosition || {};
      const batting = entry?.seasonStats?.batting || seasonStat(detail, "hitting") || {};
      return {
        id: id || detail.id || "",
        num: entry?.jerseyNumber || detail.primaryNumber || "",
        name: person.fullName || detail.fullName || "",
        pos: position.abbreviation || "",
        positionType: position.type || "",
        bats: entry?.batSide?.code || detail.batSide?.code || "",
        avg: batting.avg || "",
        obp: batting.obp || ""
      };
    }).filter(player => player.id && !starters.has(Number(player.id)) && !gamePitchers.has(Number(player.id)) && String(player.positionType).toLowerCase() !== "pitcher" && String(player.pos).toUpperCase() !== "P" && player.name).slice(0, 10).map(({positionType, ...player}) => player);
  }

  function probablePitcher(game, side, people = {}) {
    const pitcher = game?.teams?.[side]?.probablePitcher;
    if (!pitcher?.id && !pitcher?.fullName) return null;
    const detail = people[pitcher.id] || {};
    const pitching = seasonStat(detail, "pitching");
    const recordText = pitching.wins != null && pitching.losses != null ? `${pitching.wins}-${pitching.losses}` : "";
    return { id:pitcher.id||detail.id||"", num: detail.primaryNumber || "", name: pitcher.fullName || detail.fullName || "", throws: pitcherHand(detail.pitchHand?.code), record: recordText, era: pitching.era || "", k: pitching.strikeOuts != null ? String(pitching.strikeOuts) : "" };
  }

  function pitcherAlphabeticalParts(pitcher = {}) {
    const raw = String(pitcher?.name || "").trim().replace(/\s+/g, " ");
    if (!raw) return { last: "", first: "", number: String(pitcher?.num || "") };
    const comma = raw.match(/^([^,]+),\s*(.+)$/);
    if (comma) return { last: comma[1].trim(), first: comma[2].trim(), number: String(pitcher?.num || "") };
    const words = raw.split(" ");
    while (words.length > 1 && /^(jr\.?|sr\.?|ii|iii|iv|v)$/i.test(words.at(-1))) words.pop();
    const last = words.pop() || "";
    return { last, first: words.join(" "), number: String(pitcher?.num || "") };
  }

  function comparePitchersAlphabetically(a, b) {
    const left = pitcherAlphabeticalParts(a), right = pitcherAlphabeticalParts(b);
    const compare = (x, y) => String(x || "").localeCompare(String(y || ""), "en", { sensitivity: "base", numeric: true });
    return compare(left.last, right.last) || compare(left.first, right.first) || compare(left.number, right.number);
  }

  function pitcherList(boxTeam, scheduleGame, side, people = {}, rosterPayload = {}) {
    const ids = [], seen = new Set();
    const add = id => { const value=Number(id); if(value&&!seen.has(value)){seen.add(value);ids.push(value);} };
    add(scheduleGame?.teams?.[side]?.probablePitcher?.id);
    (Array.isArray(boxTeam?.pitchers) ? boxTeam.pitchers : []).forEach(add);
    rosterEntries(rosterPayload).forEach(entry => {
      const position = entry?.position || people[entry?.person?.id]?.primaryPosition || {};
      if(String(position?.type||"").toLowerCase()==="pitcher"||String(position?.abbreviation||"").toUpperCase()==="P")add(entry?.person?.id);
    });
    const probableId = Number(scheduleGame?.teams?.[side]?.probablePitcher?.id || 0);
    const pitchers = ids.map(id => {
      const entry = playerFromBox(boxTeam, id) || rosterEntryById(rosterPayload,id) || {};
      const detail = people[id] || {};
      const person = entry.person || detail || {};
      const pitching = entry.seasonStats?.pitching || seasonStat(detail, "pitching") || {};
      const recordText = pitching.wins != null && pitching.losses != null ? `${pitching.wins}-${pitching.losses}` : "";
      return {
        id: id || person.id || detail.id || "",
        num: entry.jerseyNumber || detail.primaryNumber || "",
        name: person.fullName || detail.fullName || "",
        throws: pitcherHand(entry.pitchHand?.code || detail.pitchHand?.code),
        record: recordText,
        era: pitching.era || "",
        k: pitching.strikeOuts != null ? String(pitching.strikeOuts) : ""
      };
    }).filter(pitcher=>pitcher.name||pitcher.num);
    if (!pitchers.length) {
      const probable = probablePitcher(scheduleGame, side, people);
      if (probable) pitchers.push(probable);
    }
    const probable = pitchers.find(pitcher => Number(pitcher.id) === probableId) || null;
    const alphabetical = pitchers.filter(pitcher => !probable || Number(pitcher.id) !== Number(probable.id)).sort(comparePitchersAlphabetically);
    return [...(probable ? [probable] : []), ...alphabetical].slice(0, MAX_PITCHERS);
  }

  function officialLabel(official) {
    const type = official?.officialType || "Official";
    const abbreviations = {
      "Home Plate": "HP",
      "First Base": "1B",
      "Second Base": "2B",
      "Third Base": "3B",
      "Left Field": "LF",
      "Right Field": "RF"
    };
    return `${abbreviations[type] || type}: ${official?.official?.fullName || "TBA"}`;
  }

  function broadcastLists(schedulePayload) {
    const game = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const broadcasts = Array.isArray(game.broadcasts) ? game.broadcasts : [];
    const tv = broadcasts.filter(item => item?.type === "TV").map(item => item.name).filter(Boolean);
    const radio = broadcasts.filter(item => item?.type === "Radio").map(item => item.name).filter(Boolean);
    return { tv: [...new Set(tv)].join(" / "), radio: [...new Set(radio)].join(" / ") };
  }

  function extraInningsRuleForGame(feed, schedulePayload) {
    const gameData = feed?.gameData || {};
    const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const gameType = gameData?.game?.type || scheduleGame?.gameType || "R";
    return ["F","D","L","W","C","P"].includes(gameType) ? "standard" : "automatic-runner";
  }

  function managerChallengeAllotmentForGame(feed, schedulePayload) {
    const gameData = feed?.gameData || {};
    const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const gameType = gameData?.game?.type || scheduleGame?.gameType || "R";
    return ["A","F","D","L","W","C","P"].includes(gameType) ? "2" : "1";
  }

  function buildGameData(feed, schedulePayload, people = {}, rosters = {}) {
    const gameData = feed?.gameData || {};
    const box = feed?.liveData?.boxscore || {};
    const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
    const awayTeam = gameData?.teams?.away || scheduleGame?.teams?.away?.team || {};
    const homeTeam = gameData?.teams?.home || scheduleGame?.teams?.home?.team || {};
    const weather = gameData?.weather || {};
    const broadcasts = broadcastLists(schedulePayload);
    const weatherParts = [
      weather.temp != null ? `${weather.temp}°F` : "",
      weather.condition || "",
      weather.wind || ""
    ].filter(Boolean);
    const officialDate = gameData?.datetime?.officialDate || scheduleGame?.officialDate || schedulePayload?.dates?.[0]?.date || "";
    const dateTime = gameData?.datetime?.dateTime || scheduleGame?.gameDate || "";

    return {
      awayTeam: awayTeam?.name || scheduleGame?.teams?.away?.team?.name || "",
      homeTeam: homeTeam?.name || scheduleGame?.teams?.home?.team?.name || "",
      awayRecord: record(awayTeam) || record(scheduleGame?.teams?.away),
      homeRecord: record(homeTeam) || record(scheduleGame?.teams?.home),
      gameDate: officialDate,
      gameTime: timeLabel(dateTime),
      venue: gameData?.venue?.name || scheduleGame?.venue?.name || "",
      gameNumber: "",
      extraInningsRule: extraInningsRuleForGame(feed, schedulePayload),
      managerChallengeAllotment: managerChallengeAllotmentForGame(feed, schedulePayload),
      weather: weatherParts.join(", "),
      umpires: (box?.officials || []).map(officialLabel).join("; "),
      broadcast: broadcasts.tv,
      radio: broadcasts.radio,
      gameNotes: "",
      away: {
        lineup: battingLineup(box?.teams?.away, people),
        bench: benchList(box?.teams?.away, people, rosters.away),
        pitchers: pitcherList(box?.teams?.away, scheduleGame, "away", people, rosters.away)
      },
      home: {
        lineup: battingLineup(box?.teams?.home, people),
        bench: benchList(box?.teams?.home, people, rosters.home),
        pitchers: pitcherList(box?.teams?.home, scheduleGame, "home", people, rosters.home)
      }
    };
  }

  async function gameViaFallback(gamePk) {
    const [feedResult, scheduleResult] = await Promise.all([
      rawMlb(`/api/v1.1/game/${encodeURIComponent(gamePk)}/feed/live`),
      rawMlb(`/api/v1/schedule?gamePk=${encodeURIComponent(gamePk)}&hydrate=broadcasts(all),team,venue,probablePitcher`)
    ]);
    const officialDate=feedResult.payload?.gameData?.datetime?.officialDate||scheduleResult.payload?.dates?.[0]?.date||"";
    const rosters={away:null,home:null},rosterSources=[];
    const rosterRequests=["away","home"].map(async side=>{
      const teamId=teamIdForSide(feedResult.payload,scheduleResult.payload,side);if(!teamId)return;
      const result=await rawMlb(`/api/v1/teams/${encodeURIComponent(teamId)}/roster?rosterType=active${officialDate?`&date=${encodeURIComponent(officialDate)}`:""}`);
      rosters[side]=result.payload;rosterSources.push(result.source);
    });
    await Promise.allSettled(rosterRequests);
    let people = {};
    try {
      const ids = collectGamePersonIds(feedResult.payload, scheduleResult.payload, rosters);
      if (ids.length) {
        const peopleResult = await rawMlb(`/api/v1/people?personIds=${ids.join(",")}&hydrate=currentTeam,stats(group=[hitting,pitching],type=[season])`);
        people = peopleLookup(peopleResult.payload);
      }
    } catch (error) {
      console.warn("Player season-stat enrichment was unavailable.", error);
    }
    return {
      gamePk,
      data: buildGameData(feedResult.payload, scheduleResult.payload, people, rosters),
      status: feedResult.payload?.gameData?.status?.detailedState || "",
      source: [...new Set([feedResult.source, scheduleResult.source,...rosterSources])].join(" + ")
    };
  }

  async function getGame(gamePk) {
    const errors = [];
    if (sameOriginAvailable()) {
      try {
        const payload = await fetchJson(sameOriginUrl({ action: "game", gamePk }));
        if (!payload?.data) throw new Error("The app service returned incomplete game information.");
        return { ...payload, source: payload.source || "app data service" };
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      return await gameViaFallback(gamePk);
    } catch (error) {
      errors.push(error);
    }

    const message = errors.map(error => error?.message).filter(Boolean).join("; ");
    throw new Error(message || "The selected game could not be loaded.");
  }

  const api = {
    LEVELS,
    localDateISO,
    timeLabel,
    normalizeScheduleGame,
    buildGameData,
    getSchedule,
    getGame
  };

  global.BaseballData = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
