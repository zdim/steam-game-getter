/*jshint esversion: 6 */
const http = require("http");

const host = "api.steampowered.com";
const key = process.env.STEAM_KEY;

function getIdFromCustomUrl(customUrl) {
  const options = {
    hostname: host,
    method: "GET",
    path: `/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${customUrl}`
  };

  return new Promise((resolve, reject) => {
    http
      .request(options, res => {
        let chunks = [];
        res.setEncoding("utf8");
        res
          .on("data", data => { chunks.push(data); })
          .on("error", err => {
            console.error(err.message);
            reject(err.message);
          })
          .on("end", () => {
            try {
              const data = JSON.parse(chunks.join(""));
              if (data.response) {
                resolve(data.response.steamid);
              } else {
                console.error("Error retrieving Custom URL: " + customUrl);
                reject("Error retrieving Custom URL: " + customUrl);
              }
            } catch (err) {
              console.error("ERROR IN STEAM VANITY URL: " + err);
              reject("Oops! Error retrieving data from Steam. Please try again.");
            }
          });
      })
      .end();
  });
}

function gameRequest(steamId) {
  const getFullGameInfo = true;
  const getGamesOptions = {
    hostname: host,
    path: `/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&include_freegames=1&include_appinfo=${
      getFullGameInfo ? "1" : "0"
    }`,
    method: "GET",
    json: true
  };


  return new Promise((resolve, reject) => {
    http
      .request(getGamesOptions, res => {
        res.setEncoding("utf8");
        let chunks = [];
        res
          .on("data", data => { chunks.push(data); })
          .on("error", err => {
            console.error(err.message);
          })
          .on("end", () => {
            if (res.statusCode != 200) {
              reject(
                "Oops! Something went wrong. Check your IDs and try again."
              );
            } else {
              try {
                const fullData = chunks.join("");              
                const games = JSON.parse(fullData).response.games;
                resolve(games);
              } catch (err) {
                reject("Oops! Error retrieving data from Steam. Please try again.");
              }
            }
          });
      })
      .on("error", err => {
        console.error(`Error in request for ${steamId}: ${err.message}`);
      })
      .end();
  });
}

async function handleSteamId(steamId) {
  if (steamId.length < 17 || isNaN(steamId)) {
    const steam64Id = await getIdFromCustomUrl(steamId);
    return await gameRequest(steam64Id);
  } else {
    return await gameRequest(steamId);
  }
}

async function getGames(steamIds) {
  const gameLists = await Promise.all(steamIds.map(handleSteamId));
  return gameLists;
}

exports.getGames = getGames;
