const assert = require('node:assert/strict');
const BaseballData = require('../baseball-data.js');

const schedulePayload = {
  dates: [{
    date: '2026-06-19',
    games: [{
      gamePk: 900001,
      officialDate: '2026-06-19',
      gameDate: '2026-06-19T23:10:00Z',
      status: { detailedState: 'Scheduled' },
      venue: { name: 'Citi Field' },
      teams: {
        away: { team: { name: 'Philadelphia Phillies' } },
        home: { team: { name: 'New York Mets' } }
      }
    }]
  }]
};

const feedPayload = {
  gameData: {
    datetime: { officialDate: '2026-06-19', dateTime: '2026-06-19T23:10:00Z' },
    status: { detailedState: 'Scheduled' },
    venue: { name: 'Citi Field' },
    teams: {
      away: { name: 'Philadelphia Phillies', record: { wins: 42, losses: 31 } },
      home: { name: 'New York Mets', record: { wins: 44, losses: 29 } }
    },
    weather: { temp: 78, condition: 'Partly Cloudy', wind: '8 mph, Out To RF' }
  },
  liveData: {
    boxscore: {
      officials: [{ officialType: 'Home Plate', official: { fullName: 'Test Umpire' } }],
      teams: {
        away: {
          battingOrder: [101],
          pitchers: [201],
          players: {
            ID101: { jerseyNumber: '10', person: { fullName: 'Away Batter' }, position: { abbreviation: 'SS' }, batSide: { code: 'R' }, seasonStats: { batting: { avg: '.300', obp: '.380' } } },
            ID201: { jerseyNumber: '45', person: { fullName: 'Away Pitcher' }, pitchHand: { code: 'R' }, seasonStats: { pitching: { wins: 6, losses: 2, era: '2.95', strikeOuts: 81 } } }
          }
        },
        home: {
          battingOrder: [102],
          pitchers: [202],
          players: {
            ID102: { jerseyNumber: '20', person: { fullName: 'Home Batter' }, position: { abbreviation: 'CF' }, batSide: { code: 'L' }, seasonStats: { batting: { avg: '.285', obp: '.360' } } },
            ID202: { jerseyNumber: '35', person: { fullName: 'Home Pitcher' }, pitchHand: { code: 'L' }, seasonStats: { pitching: { wins: 7, losses: 3, era: '3.10', strikeOuts: 76 } } }
          }
        }
      }
    }
  }
};

const detailSchedulePayload = {
  dates: [{
    date: '2026-06-19',
    games: [{
      gamePk: 900001,
      officialDate: '2026-06-19',
      gameDate: '2026-06-19T23:10:00Z',
      venue: { name: 'Citi Field' },
      teams: {
        away: { team: { name: 'Philadelphia Phillies' }, leagueRecord: { wins: 42, losses: 31 } },
        home: { team: { name: 'New York Mets' }, leagueRecord: { wins: 44, losses: 29 } }
      },
      broadcasts: [
        { type: 'TV', name: 'SNY' },
        { type: 'Radio', name: 'WCBS 880' }
      ]
    }]
  }]
};

function response(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(payload) };
}

(async () => {
  const requested = [];
  global.fetch = async url => {
    requested.push(String(url));
    const decoded = decodeURIComponent(String(url));
    if (decoded.includes('/feed/live')) return response(feedPayload);
    if (decoded.includes('gamePk=900001')) return response(detailSchedulePayload);
    return response(schedulePayload);
  };

  const schedule = await BaseballData.getSchedule('2026-06-19', 'mlb');
  assert.equal(schedule.games.length, 1);
  assert.equal(schedule.games[0].gamePk, 900001);
  assert.match(schedule.games[0].label, /Philadelphia Phillies at New York Mets/);

  const game = await BaseballData.getGame(900001);
  assert.equal(game.data.awayTeam, 'Philadelphia Phillies');
  assert.equal(game.data.homeTeam, 'New York Mets');
  assert.equal(game.data.away.lineup[0].name, 'Away Batter');
  assert.equal(game.data.home.pitchers[0].name, 'Home Pitcher');
  assert.equal(game.data.broadcast, 'SNY');
  assert.equal(game.data.radio, 'WCBS 880');
  assert.match(game.data.umpires, /HP: Test Umpire/);
  assert.ok(requested.some(url => url.includes('baseballscorecardcreator.netlify.app')));

  assert.match(BaseballData.localDateISO('America/New_York', new Date('2026-06-20T02:00:00Z')), /^2026-06-19$/);
  console.log('baseball-data tests passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
