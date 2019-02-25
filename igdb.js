/*jshint esversion: 6 */
const http = require('http');

const options = {
    hostname: 'api-v3.igdb.com',
    path: '/games/',
    method: 'POST',
    headers: {
        'user-key': process.env.IGDB_KEY
    }
};

/*
 * game_modes:          2, 3, 5 = Multiplayer, Cooperative, MMO
 * category:            0       = Full Game (not dlc or expansion)
 * platforms:           6       = Windows PC
 * websites.category:   13      = Steam
 */
function igdbRequest(_offset, _data, _date, _callback) {  
    const body = `fields websites.url; where game_modes = (2,3,5) & category = 0 & platforms = (6) & websites.category = 13 & first_release_date >= ${_date} & rating > 50; sort first_release_date asc; limit 50; offset ${_offset};`;
    let gameData = [];
    const multiplayerGamesReq = http.request(options, 
        res => {
            res.setEncoding('utf8');
            res.on('data', data => {
                gameData.push(data);
            }).on('end', () => {
                // igdb only allows a max offset of 150 with the free plan, so we can only really get the first 200
                // which is why I added the rating filter, to help narrow the list to < 200 results
                if(_offset === 150) {
                    const parsedData = JSON.parse(gameData.join(''));
                    return _callback(_data.concat(parsedData));
                } else {
                    const parsedData = JSON.parse(gameData.join(''));
                    return igdbRequest(_offset + 50, _data.concat(parsedData), _date, _callback);
                }
            });
        }
    );

    multiplayerGamesReq.write(body);
    multiplayerGamesReq.end();
}

function getCoopGames(_callback) {
    // random date in epoch ms to filter the results
    // date is between 1-1-1990 (631152000 unix) and 3 years ago
    const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).getTime() / 1000;
    const date = Math.floor(Math.random() * (twoYearsAgo - 631152000 + 1)) + 631152000;
    igdbRequest(0, [], date, _callback);
}

exports.getCoopGames = getCoopGames;