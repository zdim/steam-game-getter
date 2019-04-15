exports.getRandomNumber = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.crossReferenceCoopGames = function (steamGames, coopGames) {
  const sharedCoopGames = steamGames.filter(game => {
    return coopGames.some(g =>
      g.websites.some(w => w.url.endsWith(`/${game.id}`))
    );
  });

  return sharedCoopGames;
}

exports.filterGames = function (gamesLists) {
  function filterByAppId(listOne, listTwo) {
    if (listTwo && listTwo.length > 0) {
      return listOne.filter(element => {
        return listTwo.some(g => g.appid === element.appid);
      });
    }
  }

  // remove empty lists
  gamesLists = gamesLists.filter(list => list && list.length > 0);

  if (gamesLists.length == 0) {
    throw "You have no multiplayer games in common!";
  }

  // sort the arrays so the one with the full app info is first
  gamesLists.sort((a, b) => {
    return a[0].name ? -1 : b[0].name ? 1 : 0;
  });

  let sharedGames = gamesLists.shift();
  gamesLists.forEach(element => {
    sharedGames = filterByAppId(sharedGames, element);
  });

  sharedGames = sharedGames.map(game => {
    return { id: game.appid, name: game.name };
  });

  return sharedGames;
}