# 2hex-starboard
A discord bot that runs a starboard for users

# Requirements
Node installed with NPM. I use v10.16.3 for node and 6.9.0 for npm, but earlier versions should work

# Installation
Clone the github repository, and install dependencies as follows:
```bash
npm install quick.db
npm install discord.js
```
<br> <br>
Note that with discord.js it is required to have python 2.x (preferably 2.6) and if on windows, the Visual C++ Build Tools (`npm install --global windows-build-tools --vs2015`)

Then, configure the config.json file to have the properties set up as you like:<br>
`prefix`(any) - The prefix for the bot<br>
`communityGuildId`(string) - The community guild where users can post submissions<br>
`starboardGuildId`(string) - The starboard guild id where submissions past `reactionsNeeded` will go<br>
`starboardChannelId` - The guild where the starboard goes<br>
`reaction` - What reaction is given to all submissions<br>
`reactionsNeeded` - The amount of reactions needed for a post to go from community board --> starboard<br>

# Enviromental Variables
`BOT_TOKEN` = bot token
`PREFIX` = the prefix for all the bot commands
`COMMUNITYGUILDID` = The community guild ID for submissions
`STARBOARDGUILDID` = The starboard guild ID
`COMMUNITYSUBMISSIONCHANNELID` = The community submission channel ID
`REACTION` = The reaction when messages are posted
`REACTIONSNEEDED` = The amount of reactions for a starboard post to be created

**NOTE: ENVIROMENTAL VARIABLES OVERRIDE CONFIG FILES**

## Usage
```js
node .
```

## License
[0BSD](https://opensource.org/licenses/0BSD)

## Demo
See a demo at [This Discord Server](http://devarchives.xyz/discord), with the starboard [Here](https://discordapp.com/invite/NnH4zTG)
