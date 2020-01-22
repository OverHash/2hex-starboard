# 2hex-starboard
A discord bot that runs a starboard for users

# Requirements
**npm 6.0.0 or later is required**
Node installed with npm. I use v10.16.3 for node and 6.9.0 for npm, but earlier versions should work

# Installation
Clone the github repository, and install dependencies as follows:
```bash
npm install quick.db
npm install discord.js
```
<br> <br>
Note that with discord.js it is required to have python 2.x (preferably 2.6) and if on windows, the Visual C++ Build Tools (`npm install --global windows-build-tools --vs2015`)

# Enviromental Variables | Config
`BOT_TOKEN` = bot token<br>
`PREFIX` = the prefix for all the bot commands<br>
`ROLEGIVEPREFIX` = the prefix users use to give/remove roles<br>
`COMMUNITYGUILDID` = The community guild ID for submissions<br>
`STARBOARDGUILDID` = The starboard guild ID<br>
`COMMUNITYSUBMISSIONCHANNELID` = The community submission channel ID<br>
`REACTION` = The reaction when messages are posted<br>
`REACTIONSNEEDED` = The amount of reactions for a starboard post to be created<br>

**NOTE: ENVIROMENTAL VARIABLES OVERRIDE CONFIG FILES**

## Usage
```js
node .
```

## License
[0BSD](https://opensource.org/licenses/0BSD)

## Demo
See a demo at [This Discord Server](http://devarchives.xyz/discord), with the starboard [Here](https://discordapp.com/invite/NnH4zTG)
