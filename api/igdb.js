/*jshint esversion: 6 */
const http = require("http");

const options = {
  hostname: "api-v3.igdb.com",
  path: "/games/",
  method: "POST",
  headers: {
    "user-key": process.env.IGDB_KEY
  }
};

/*
 * game_modes:          2, 3, 5 = Multiplayer, Cooperative, MMO
 * category:            0       = Full Game (not dlc or expansion)
 * platforms:           6       = Windows PC
 * websites.category:   13      = Steam
 */
function igdbRequest(offset, date) {
  const body = `fields websites.url; where game_modes = (2,3,5) & category = 0 & platforms = (6) & websites.category = 13 & first_release_date >= ${date} & rating > 50; sort first_release_date asc; limit 50; offset ${offset};`;

  return new Promise((resolve, reject) => {
    const multiplayerGamesReq = http.request(options, res => {
      let gameData = [];
      res.setEncoding("utf8");
      res
        .on("data", data => gameData.push(data))
        .on("error", err => reject(err.message))
        .on("end", () => {
          const parsedData = JSON.parse(gameData.join(""));
          resolve(parsedData);
        });
    });

    multiplayerGamesReq.write(body);
    multiplayerGamesReq.end();
  });
}

async function getCoopGames() {
  // random date in epoch ms to filter the results
  // date is between 1-1-1990 (631152000 unix) and 3 years ago
  const threeYearsAgo =
    new Date(new Date().setFullYear(new Date().getFullYear() - 3)).getTime() /
    1000;
  const date =
    Math.floor(Math.random() * (threeYearsAgo - 631152000 + 1)) + 631152000;

  // igdb only allows a max offset of 150 with the free plan, so we can only really get the first 200
  // which is why I added the rating filter, to help narrow the list to < 200 results
  const igdbRequests = [
    igdbRequest(0, date),
    igdbRequest(50, date),
    igdbRequest(100, date),
    igdbRequest(150, date)
  ];

  const coopGameLists = await Promise.all(igdbRequests);

  // merging arrays
  // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
  return [].concat.apply([], coopGameLists);
}

exports.getCoopGames = getCoopGames;