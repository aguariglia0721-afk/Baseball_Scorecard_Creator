import type { Config, Context } from "@netlify/functions";

const MLB_ORIGIN = "https://statsapi.mlb.com";
const API = `${MLB_ORIGIN}/api`;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_PITCHERS = 15;
const LEVELS: Record<string, number[]> = {
  mlb: [1],
  "all-pro": [1, 11, 12, 13, 14, 16],
  "all-milb": [11, 12, 13, 14, 16],
  "triple-a": [11],
  "double-a": [12],
  "high-a": [13],
  "single-a": [14],
  rookie: [16]
};

function json(body: unknown, status = 200, cacheControl = "public, max-age=60, s-maxage=300") {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cacheControl }
  });
}

async function getJson(url: string, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Guariglia-Baseball-Scorecard/27.1"
        },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`MLB data request failed (${response.status})`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 250 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  if (lastError instanceof Error && lastError.name === "AbortError") {
    throw new Error("MLB data request timed out");
  }
  throw lastError instanceof Error ? lastError : new Error("MLB data request failed");
}

function timeLabel(dateTime?: string) {
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

function record(team: any) {
  const r = team?.record || team?.leagueRecord;
  if (!r || r.wins == null || r.losses == null) return "";
  return `${r.wins}-${r.losses}`;
}

function normalizeScheduleGame(game: any, sportId: number) {
  const away = game?.teams?.away?.team?.name || "Away";
  const home = game?.teams?.home?.team?.name || "Home";
  const status = game?.status?.detailedState || game?.status?.abstractGameState || "Scheduled";
  const venue = game?.venue?.name || "Venue TBA";
  return {
    gamePk: game.gamePk,
    sportId,
    officialDate: game.officialDate,
    awayTeam: away,
    homeTeam: home,
    status,
    venue,
    dateTime: game.gameDate,
    label: `${away} at ${home} — ${timeLabel(game.gameDate)} — ${venue} (${status})`
  };
}

async function schedule(date: string, level: string) {
  const sports = LEVELS[level] || LEVELS.mlb;
  const settled = await Promise.allSettled(sports.map(async sportId => {
    const url = `${API}/v1/schedule?sportId=${sportId}&startDate=${encodeURIComponent(date)}&endDate=${encodeURIComponent(date)}&hydrate=team,venue,probablePitcher`;
    const payload = await getJson(url);
    const games = (payload.dates || [])
      .flatMap((day: any) => day.games || [])
      .map((game: any) => normalizeScheduleGame(game, sportId));
    return games;
  }));

  const fulfilled = settled.filter((result): result is PromiseFulfilledResult<any[]> => result.status === "fulfilled");
  if (!fulfilled.length) {
    const reasons = settled
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map(result => result.reason instanceof Error ? result.reason.message : String(result.reason))
      .join("; ");
    throw new Error(reasons || "No schedule source responded");
  }

  const games = fulfilled
    .flatMap(result => result.value)
    .filter(game => game.gamePk)
    .sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)) || a.awayTeam.localeCompare(b.awayTeam));

  const failedLevels = settled.filter(result => result.status === "rejected").length;
  return { date, level, games, source: "app data service", partial: failedLevels > 0 };
}

function playerFromBox(boxTeam: any, id: number) {
  return boxTeam?.players?.[`ID${id}`] || null;
}

function seasonStat(person: any, groupName: string) {
  const groups = Array.isArray(person?.stats) ? person.stats : [];
  const match = groups.find((item: any) => {
    const group = item?.group?.displayName || item?.group?.name || item?.group;
    return String(group || "").toLowerCase() === groupName.toLowerCase();
  });
  return match?.splits?.[0]?.stat || {};
}

function peopleLookup(payload: any) {
  return Object.fromEntries((payload?.people || []).filter((person: any) => person?.id).map((person: any) => [person.id, person]));
}

function rosterEntries(payload: any) {
  return Array.isArray(payload?.roster) ? payload.roster : [];
}

function rosterPersonIds(rosters: Record<string, any> = {}) {
  return [...new Set(["away", "home"].flatMap(side => rosterEntries(rosters?.[side]).map((entry: any) => entry?.person?.id).filter(Boolean)))];
}

function pitcherHand(value: any) {
  const code = String(value || "").trim().toUpperCase();
  if (!code) return "";
  return code.endsWith("HP") ? code : `${code}HP`;
}

function rosterEntryById(rosterPayload: any, id: number) {
  return rosterEntries(rosterPayload).find((entry: any) => Number(entry?.person?.id) === Number(id)) || null;
}

function collectGamePersonIds(feed: any, schedulePayload: any, rosters: Record<string, any> = {}) {
  const box = feed?.liveData?.boxscore || {};
  const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
  const ids: number[] = [];
  for (const side of ["away", "home"] as const) {
    const team = box?.teams?.[side] || {};
    ids.push(...(team.battingOrder || []), ...(team.pitchers || []), ...Object.values(team.players || {}).map((entry: any) => entry?.person?.id).filter(Boolean));
    const probable = scheduleGame?.teams?.[side]?.probablePitcher?.id;
    if (probable) ids.push(probable);
  }
  ids.push(...rosterPersonIds(rosters));
  return [...new Set(ids.filter(Boolean))];
}

function battingLineup(boxTeam: any, people: Record<number, any> = {}) {
  const order: number[] = boxTeam?.battingOrder || [];
  return order.slice(0, 9).map(id => {
    const entry = playerFromBox(boxTeam, id) || {};
    const detail = people[id] || {};
    const person = entry.person || detail || {};
    const batting = entry.seasonStats?.batting || seasonStat(detail, "hitting") || {};
    return {
      num: entry.jerseyNumber || detail.primaryNumber || "",
      name: person.fullName || detail.fullName || "",
      pos: entry.position?.abbreviation || detail.primaryPosition?.abbreviation || "",
      bats: entry.batSide?.code || detail.batSide?.code || "",
      avg: batting.avg || "",
      obp: batting.obp || ""
    };
  });
}

function benchList(boxTeam: any, people: Record<number, any> = {}, rosterPayload: any = {}) {
  const starters = new Set((boxTeam?.battingOrder || []).map(Number));
  const gamePitchers = new Set((boxTeam?.pitchers || []).map(Number));
  const entries = new Map<number, any>();
  Object.values(boxTeam?.players || {}).forEach((entry: any) => { const id=Number(entry?.person?.id); if(id)entries.set(id,entry); });
  rosterEntries(rosterPayload).forEach((entry: any) => { const id=Number(entry?.person?.id); if(id&&!entries.has(id))entries.set(id,entry); });
  return [...entries.entries()].map(([id,entry]) => {
    const detail = people[id] || {};
    const person = entry?.person || detail || {};
    const position = entry?.position || detail.primaryPosition || {};
    const batting = entry?.seasonStats?.batting || seasonStat(detail, "hitting") || {};
    return {
      id,
      num: entry?.jerseyNumber || detail.primaryNumber || "",
      name: person.fullName || detail.fullName || "",
      pos: position.abbreviation || "",
      positionType: position.type || "",
      bats: entry?.batSide?.code || detail.batSide?.code || "",
      avg: batting.avg || "",
      obp: batting.obp || ""
    };
  }).filter(player => player.id && !starters.has(Number(player.id)) && !gamePitchers.has(Number(player.id)) && String(player.positionType).toLowerCase() !== "pitcher" && String(player.pos).toUpperCase() !== "P" && player.name).slice(0,10).map(({positionType,...player})=>player);
}

function probablePitcher(game: any, side: "away" | "home", people: Record<number, any> = {}) {
  const pitcher = game?.teams?.[side]?.probablePitcher;
  if (!pitcher?.id && !pitcher?.fullName) return null;
  const detail = people[pitcher.id] || {};
  const pitching = seasonStat(detail, "pitching");
  const recordText = pitching.wins != null && pitching.losses != null ? `${pitching.wins}-${pitching.losses}` : "";
  return { id:pitcher.id||detail.id||"", num: detail.primaryNumber || "", name: pitcher.fullName || detail.fullName || "", throws: pitcherHand(detail.pitchHand?.code), record: recordText, era: pitching.era || "", k: pitching.strikeOuts != null ? String(pitching.strikeOuts) : "" };
}

function pitcherAlphabeticalParts(pitcher: any = {}) {
  const raw=String(pitcher?.name||"").trim().replace(/\s+/g," ");
  if(!raw)return {last:"",first:"",number:String(pitcher?.num||"")};
  const comma=raw.match(/^([^,]+),\s*(.+)$/);
  if(comma)return {last:comma[1].trim(),first:comma[2].trim(),number:String(pitcher?.num||"")};
  const words=raw.split(" ");
  while(words.length>1&&/^(jr\.?|sr\.?|ii|iii|iv|v)$/i.test(words.at(-1)))words.pop();
  const last=words.pop()||"";
  return {last,first:words.join(" "),number:String(pitcher?.num||"")};
}

function comparePitchersAlphabetically(a: any,b: any){
  const left=pitcherAlphabeticalParts(a),right=pitcherAlphabeticalParts(b),compare=(x:any,y:any)=>String(x||"").localeCompare(String(y||""),"en",{sensitivity:"base",numeric:true});
  return compare(left.last,right.last)||compare(left.first,right.first)||compare(left.number,right.number);
}

function pitcherList(boxTeam: any, scheduleGame: any, side: "away" | "home", people: Record<number, any> = {}, rosterPayload: any = {}) {
  const ids: number[] = [], seen = new Set<number>();
  const add = (id: any) => { const value=Number(id); if(value&&!seen.has(value)){seen.add(value);ids.push(value);} };
  add(scheduleGame?.teams?.[side]?.probablePitcher?.id);
  (boxTeam?.pitchers || []).forEach(add);
  rosterEntries(rosterPayload).forEach((entry: any) => {
    const position = entry?.position || people[entry?.person?.id]?.primaryPosition || {};
    if(String(position?.type||"").toLowerCase()==="pitcher"||String(position?.abbreviation||"").toUpperCase()==="P")add(entry?.person?.id);
  });
  const probableId=Number(scheduleGame?.teams?.[side]?.probablePitcher?.id||0);
  const pitchers = ids.map(id => {
    const entry = playerFromBox(boxTeam,id) || rosterEntryById(rosterPayload,id) || {};
    const detail = people[id] || {};
    const person = entry.person || detail || {};
    const pitching = entry.seasonStats?.pitching || seasonStat(detail,"pitching") || {};
    const recordText = pitching.wins != null && pitching.losses != null ? `${pitching.wins}-${pitching.losses}` : "";
    return {
      id,
      num: entry.jerseyNumber || detail.primaryNumber || "",
      name: person.fullName || detail.fullName || "",
      throws: pitcherHand(entry.pitchHand?.code || detail.pitchHand?.code),
      record: recordText,
      era: pitching.era || "",
      k: pitching.strikeOuts != null ? String(pitching.strikeOuts) : ""
    };
  }).filter(pitcher=>pitcher.name||pitcher.num);
  if(!pitchers.length){const probable=probablePitcher(scheduleGame,side,people);if(probable)pitchers.push(probable);}
  const probable=pitchers.find(pitcher=>Number(pitcher.id)===probableId)||null;
  const alphabetical=pitchers.filter(pitcher=>!probable||Number(pitcher.id)!==Number(probable.id)).sort(comparePitchersAlphabetically);
  return [...(probable?[probable]:[]),...alphabetical].slice(0,MAX_PITCHERS);
}

function officialLabel(official: any) {
  const type = official.officialType || "Official";
  const abbreviations: Record<string, string> = {
    "Home Plate": "HP",
    "First Base": "1B",
    "Second Base": "2B",
    "Third Base": "3B",
    "Left Field": "LF",
    "Right Field": "RF"
  };
  return `${abbreviations[type] || type}: ${official.official?.fullName || "TBA"}`;
}

function broadcastLists(schedulePayload: any) {
  const game = schedulePayload?.dates?.[0]?.games?.[0] || {};
  const broadcasts = game.broadcasts || [];
  const tv = broadcasts.filter((item: any) => item.type === "TV").map((item: any) => item.name).filter(Boolean);
  const radio = broadcasts.filter((item: any) => item.type === "Radio").map((item: any) => item.name).filter(Boolean);
  return { tv: [...new Set(tv)].join(" / "), radio: [...new Set(radio)].join(" / ") };
}

async function gameDetails(gamePk: string) {
  const [feed, schedulePayload] = await Promise.all([
    getJson(`${API}/v1.1/game/${encodeURIComponent(gamePk)}/feed/live`),
    getJson(`${API}/v1/schedule?gamePk=${encodeURIComponent(gamePk)}&hydrate=broadcasts(all),team,venue,probablePitcher`)
  ]);
  const gd = feed.gameData || {};
  const box = feed.liveData?.boxscore || {};
  const scheduleGame = schedulePayload?.dates?.[0]?.games?.[0] || {};
  const awayTeam = gd.teams?.away || scheduleGame?.teams?.away?.team || {};
  const homeTeam = gd.teams?.home || scheduleGame?.teams?.home?.team || {};
  const officialDate = gd.datetime?.officialDate || scheduleGame?.officialDate || schedulePayload?.dates?.[0]?.date || "";
  const rosters: Record<string, any> = {away:null,home:null};
  await Promise.allSettled((["away","home"] as const).map(async side=>{
    const teamId=gd.teams?.[side]?.id||scheduleGame?.teams?.[side]?.team?.id;if(!teamId)return;
    rosters[side]=await getJson(`${API}/v1/teams/${encodeURIComponent(teamId)}/roster?rosterType=active${officialDate?`&date=${encodeURIComponent(officialDate)}`:""}`);
  }));
  const weather = gd.weather || {};
  const broadcasts = broadcastLists(schedulePayload);
  let people: Record<number, any> = {};
  try {
    const ids = collectGamePersonIds(feed, schedulePayload, rosters);
    if (ids.length) {
      const payload = await getJson(`${API}/v1/people?personIds=${ids.join(",")}&hydrate=currentTeam,stats(group=[hitting,pitching],type=[season])`);
      people = peopleLookup(payload);
    }
  } catch (error) {
    console.warn("Player season-stat enrichment was unavailable.", error);
  }
  const weatherParts = [weather.temp != null ? `${weather.temp}°F` : "", weather.condition, weather.wind].filter(Boolean);
  const dateTime = gd.datetime?.dateTime || scheduleGame?.gameDate;
  const gameType = gd.game?.type || scheduleGame?.gameType || "R";
  const extraInningsRule = ["F","D","L","W","C","P"].includes(gameType) ? "standard" : "automatic-runner";
  const managerChallengeAllotment = ["A","F","D","L","W","C","P"].includes(gameType) ? "2" : "1";
  const data = {
    awayTeam: awayTeam.name || scheduleGame?.teams?.away?.team?.name || "",
    homeTeam: homeTeam.name || scheduleGame?.teams?.home?.team?.name || "",
    awayRecord: record(awayTeam) || record(scheduleGame?.teams?.away),
    homeRecord: record(homeTeam) || record(scheduleGame?.teams?.home),
    gameDate: officialDate,
    gameTime: timeLabel(dateTime),
    venue: gd.venue?.name || scheduleGame?.venue?.name || "",
    gameNumber: "",
    extraInningsRule,
    managerChallengeAllotment,
    weather: weatherParts.join(", "),
    umpires: (box.officials || []).map(officialLabel).join("; "),
    broadcast: broadcasts.tv,
    radio: broadcasts.radio,
    gameNotes: "",
    away: {
      lineup: battingLineup(box.teams?.away, people),
      bench: benchList(box.teams?.away, people, rosters.away),
      pitchers: pitcherList(box.teams?.away, scheduleGame, "away", people, rosters.away)
    },
    home: {
      lineup: battingLineup(box.teams?.home, people),
      bench: benchList(box.teams?.home, people, rosters.home),
      pitchers: pitcherList(box.teams?.home, scheduleGame, "home", people, rosters.home)
    }
  };
  return { gamePk, data, status: gd.status?.detailedState || "", source: "app data service" };
}

async function legacyProxy(endpoint: string) {
  if (!endpoint.startsWith("/api/")) return json({ error: "A valid MLB API endpoint is required." }, 400);
  const target = new URL(endpoint, MLB_ORIGIN);
  if (target.origin !== MLB_ORIGIN || !target.pathname.startsWith("/api/")) {
    return json({ error: "Invalid endpoint" }, 400);
  }
  const payload = await getJson(target.toString());
  return json(payload);
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method !== "GET") return json({ error: "GET requests only" }, 405, "no-store");
    const url = new URL(req.url);

    const endpoint = url.searchParams.get("endpoint");
    if (endpoint) return await legacyProxy(endpoint);

    const action = url.searchParams.get("action") || "schedule";
    if (action === "health") return json({ ok: true, version: "27.1", source: "app data service" }, 200, "no-store");
    if (action === "schedule") {
      const date = url.searchParams.get("date");
      if (!date) return json({ error: "A date is required" }, 400, "no-store");
      return json(await schedule(date, url.searchParams.get("level") || "mlb"));
    }
    if (action === "game") {
      const gamePk = url.searchParams.get("gamePk");
      if (!gamePk) return json({ error: "A gamePk is required" }, 400, "no-store");
      return json(await gameDetails(gamePk));
    }
    return json({ error: "Unknown action" }, 400, "no-store");
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unknown server error" }, 500, "no-store");
  }
};

export const config: Config = { path: "/api/mlb" };
