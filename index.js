/*jshint esversion: 6 */
require('dotenv').config();
const discord = require('discord.js');
const igdb = require('./igdb');
const steam = require('./steam');

const bot = new discord.Client();

bot.on('message', message => {
    if(message.author == bot.user || !message.content.startsWith("!")) return;

    const splitCommand = message.content.split(" ").filter(Boolean);
    const args = splitCommand.slice(1);
    const sendMessage = msg => message.channel.send(msg);

    switch(splitCommand[0]) {
        case "!wswp": 
            whatShouldWePlay(args, sendMessage);        
            break;
        case "!wsip": 
            whatShouldIPlay(args, sendMessage);
            break;
    }
});

bot.login(process.env.BOT_KEY);

function whatShouldWePlay(steamIds, respond) {
    console.log(steamIds);
    if(steamIds.length < 2 || steamIds.length > 4) {
        respond('Sorry! **!wswp** only works with 2 to 4 IDs.');
        return;
    } 

    steam.getGames(steamIds, filterGames, respond);
}

function whatShouldIPlay(steamId, respond) {    
    if(steamId.length != 1) {
        respond('Sorry! **!wsip** only works with 1 ID.');
        return;
    }

    steam.getGames(
        steamId,
        (games, respond) => {
            if(games && games.length > 0) {
                games = games.shift();
                const theGame = games[getRandomNumber(0, games.length - 1)];
                respond(`You should play **${theGame.name}**`);
            } else {
                respond('You have no games!');
            }
        },
        respond);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function crossReferenceCoopGames(games, respond) {
    igdb.getCoopGames(coopGames => {        
        const sharedCoopGames = games.filter(game => {
            return coopGames.some(g => g.websites.some(w => w.url.endsWith(`/${game.id}`)));
        });

        const theGame = sharedCoopGames[getRandomNumber(0, sharedCoopGames.length - 1)];
        respond(`You should play **${theGame.name}**`);
    } );
}

function filterByAppId(listOne, listTwo) {
    if(listTwo && listTwo.length > 0) {
        return listOne.filter(element => {
            return listTwo.some(g => g.appid === element.appid);
        });
    }
}

function filterGames(gamesLists, respond) {
    // remove empty lists
    gamesLists = gamesLists.filter(list => list && list.length > 0);

    if(gamesLists.length == 0) {
        respond('You have no multiplayer games in common!');
        return;
    }

    // sort the arrays so the one with the full app info is first
    gamesLists.sort((a, b) => { return a[0].name ? -1 : b[0].name ? 1 : 0; });
    
    let sharedGames = gamesLists.shift();
    gamesLists.forEach(element => {
        sharedGames = filterByAppId(sharedGames, element);
    });

    sharedGames = sharedGames.map(game => { 
        return { 'id': game.appid, 'name': game.name }; 
    });

    // cross reference with igdb list
    crossReferenceCoopGames(sharedGames, respond);
}