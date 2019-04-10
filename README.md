# steam-game-getter
Discord bot that uses the Steam API to suggest multiplayer and cooperative games when provided with Steam IDs.

## Adding the bot
Use this [link](https://discordapp.com/oauth2/authorize?client_id=548564890902593544&scope=bot&permissions=387072) and select the server that'd you like to add the bot to.
You'll need Admin privilege within that server to add a bot.

## A note on Steam IDs
A user's Steam ID is the unique, 64bit number associated with the account. The simplest way to find a user's ID is by enabling the URL in the Steam client and viewing a user's profile. Unless you have provided a custom URL for your account, the long number at the end of the URL will be the Steam ID.

For example, in the URL https://steamcommunity.com/id/76561197960435530, 76561197960435530 is what is provided to the bot following a command.

If a custom URL is being used, you just need to provide that custom portion and the bot will detect it and look up the ID for you.

For example, if the URL is https://steamcommunity.com/id/pen_, pen_ can be provided to the bot.

There are also plenty of other tools out there to figure out a Steam ID, such as [this site](https://steamid.io/) or [this video](https://www.youtube.com/watch?v=jSyhyrYdqs8).
 
## Commands
### !wsip {id}
##### What Should I Play
This command will browse through all of the provided user's games on Steam and select one at random.
### !wswp {id} {id} {id} {id}
##### What Should We Play
This command accepts 2, 3, or 4 IDs and will select a game that each person owns and that is also marked as either Multiplayer or Cooperative on [IGDB](https://www.igdb.com/advanced_search).
