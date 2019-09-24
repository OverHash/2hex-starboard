require('dotenv').config();
const fs = require('fs');
const quickDb = require('quick.db');
const discord = require('discord.js');

const { prefix, roleGivePrefix, communityGuildId, starboardGuildId, communitySubmissionChannelId, reaction, reactionsNeeded } = require('./config.json');

const addRole = require('./functions/addRole.js')
const getStarboard = require('./functions/getStarboard.js');
const createArchive = require('./functions/createArchive.js')
const createStarpost = require('./functions/createStarpost.js');


const bot = new discord.Client();
bot.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	bot.commands.set(command.name.toLowerCase(), command);
}

bot.on('ready', () => {
	console.log('Bot logged in as ' + bot.user.username + '#' + bot.user.discriminator + ' with id: ' + bot.user.id);
	console.log('Prefix: ' + (process.env.PREFIX || prefix))
	console.log('Role give prefix: ' + (process.env.ROLEGIVEPREFIX || roleGivePrefix))
	console.log('Reaction: ' + (process.env.REACTION || reaction))
	console.log('Reactions Needed: ' + (process.env.REACTIONSNEEDED || reactionsNeeded))
	console.log('LIST OF GUILDS AVAILABLE:' + bot.guilds.map(guild => '\n' + guild.name) + '\nEND OF GUILDS AVAILABLE')

	/* Get all previous messages and check if they have been scanned */
	const guild = bot.guilds.get(process.env.COMMUNITYGUILDID || communityGuildId);

	if (guild && guild.available) {
		const submissionChannel = guild.channels.get(process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId);

		if (submissionChannel) {
			submissionChannel.fetchMessages()
				.then(pastMessages => pastMessages.filter(message => (message.attachments.first() || (message.embeds[0] && (message.embeds[0].image || message.embeds[0].video)))).forEach(message => message.react(process.env.REACTION || reaction)))
				.catch(console.error);
		}
	} else {
		console.log("\x1b[37m\x1b[41m\x1b[1m" + 'GUILD NOT AVAILABLE. PLEASE CHECK THE ID FOR THE COMMUNITY GUILD' + "\x1b[0m");
	}

	console.log('submission channel ID: ' + (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId))
});

bot.on('message', message => {
	/* Check to see if it is a new submission */
	if (message.channel.id === (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId) && (message.attachments.first() || (message.embeds[0] && (message.embeds[0].image || message.embeds[0].video)))) {
		message.react(process.env.REACTION || reaction);
	}

	/* Check to see if it is a role give */
	if (message.content.startsWith(process.env.ROLEGIVEPREFIX || roleGivePrefix) && !message.author.bot) {
		addRole(message);
	}

	/* Generic commads */
	if (!message.content.startsWith(process.env.PREFIX || prefix) || message.author.bot) return;
	const args = message.content.slice((process.env.PREFIX || prefix).length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (bot.commands.get(command)) {
		bot.commands.get(command).execute(message, args);
	}
});

bot.on('messageReactionAdd', (reaction, user) => {
	const message = reaction.message;
	/* Check to see if it is a submission */
	if (message.channel.id === (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId)) {
		/* Check to see if the message has already surpassed the required threshold */
		if ((reaction.count >= (process.env.REACTIONSNEEDED || reactionsNeeded)) && !(message.reactions.filter(obj =>  obj.emoji.name === '✅').first())) {
			/* message can be posted */
			createArchive(message);
		}
	}
})

if (!process.env.BOT_TOKEN) {
	console.error('Please provide the bot token as the BOT_TOKEN enviromental variable');
	process.exit();
}

bot.login(process.env.BOT_TOKEN)
	.catch(console.error);