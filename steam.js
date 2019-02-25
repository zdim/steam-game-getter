/*jshint esversion: 6 */
const http = require('http');

const host = 'api.steampowered.com';
const key = process.env.STEAM_KEY;

function getIdFromCustomUrl(_customUrl, _callback, _respond) {
    const options = {
        hostname: host,
        method: 'GET',
        path: `/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${_customUrl}`
    };

    const customUrlRequest = http.request(
        options,
        res => {
            let chunks = [];
            res.setEncoding('utf8');
            res.on('data', data => {
                chunks.push(data);
            }).on('end', () => {
                const data = JSON.parse(chunks.join(''));
                const id = data.response.steamid;
                _callback(id);
            });
        }
    );

    customUrlRequest.end();
}

function gameRequest(_steamId, _getFullGameInfo, _callback, _respond) {
    const getGamesOptions = {
        hostname: host,
        path: `/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${_steamId}&include_freegames=1&include_appinfo=${_getFullGameInfo ? "1" : "0"}`,
        method: 'GET',
        json: true
    };

    const getGamesReq = http.request(
        getGamesOptions,
        res => {
            res.setEncoding('utf8');
            let chunks = [];
            res.on('data', data => { 
                chunks.push(data);
            }).on('error', err => {
                console.error(err.message);
            }).on('end', () => {
                if(res.statusCode != 200) {
                    _respond('Oops! Something went wrong. Check your IDs and try again.');
                } else {                    
                    const fullData = chunks.join('');
                    const games = JSON.parse(fullData).response.games;
                    _callback(games);
                }
            });
        }
    );

    getGamesReq.on('error', err => {
        console.error(`Error in request for ${_steamId}: ${err.message}`);
    });

    getGamesReq.end();
}

function getGames(_steamIds, _callback, _respond) {
    let gamesList = [];
    let getFullGameInfo = true;

    const addToList = games => { 
        gamesList.push(games);
            if(gamesList.length == _steamIds.length) {
                _callback(gamesList, _respond);
            }
    };

    _steamIds.forEach(element => {
        // if a custom url is passed in, we need to grab the int64 id
        if(element.length < 17 || isNaN(element)) {
            getIdFromCustomUrl(
                element,
                id => { 
                    gameRequest(id, getFullGameInfo, addToList, _respond);
                    getFullGameInfo = false;
                },
                _respond);
        } else {
            gameRequest(
                element,
                getFullGameInfo,
                addToList, 
                _respond
            );

            getFullGameInfo = false;
        }        
    });
}

exports.getGames = getGames;