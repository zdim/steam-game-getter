const steam = require("./api/steam");
const igdb = require("./api/igdb");
const utils = require("./utils");

exports.whatShouldIPlay = async function(steamId) {
    if (steamId.length != 1) {
        throw "Sorry! **!wsip** only works with 1 ID.";
      }
    
      const steamGames = await steam.getGames(steamId);
      steamGames = steamGames.shift();
      const theGame = steamGames[utils.getRandomNumber(0, steamGames.length - 1)];
      return theGame.name;
}

exports.whatShouldWePlay = async function (steamIds) {
    if (steamIds.length < 2 || steamIds.length > 4) {
      throw "Sorry! **!wswp** only works with 2 to 4 IDs.";
    }
  
    const [steamGames, coopGames] = await Promise.all([
      steam.getGames(steamIds),
      igdb.getCoopGames()
    ]);
  
    const sharedSteamGames = utils.filterGames(steamGames);
    const sharedCoopGames = utils.crossReferenceCoopGames(sharedSteamGames, coopGames);
  
    const theGame =
      sharedCoopGames[utils.getRandomNumber(0, sharedCoopGames.length - 1)];
    return theGame.name;
  }