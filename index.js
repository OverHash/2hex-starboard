require('dotenv').config();
const fs = require('fs');
const quickDb = require('quick.db');
const discord = require('discord.js');

const { prefix, communityGuildId, starboardGuildId, communitySubmissionChannelId, reaction, reactionsNeeded } = require('./config.json');

const createStarpost = require('./functions/createStarpost.js');
const getStarboard = require('./functions/getStarboard.js');


const bot = new discord.Client();
bot.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	bot.commands.set(command.name.toLowerCase(), command);
}

const filter = react => react.emoji.name === reaction;
async function addCollector(message) {
	const newGuild = message.client.guilds.get(starboardGuildId);
	if (!newGuild) return console.error('Unable to get starboard guild!');
	const newChannel = await getStarboard(newGuild);
	if (!newChannel) return console.error('Unable to get starboard channel!');

	/* Create reaction collector */
	message.awaitReactions(filter, { max: reactionsNeeded })
		.then(() => {
			const currentArchive = quickDb.add('currentArchive', 1);
			const data = quickDb.set('archiveData_' + currentArchive, { channel: message.channel.id, guild: message.guild.id, message: message.id, date: new Date, authorId: message.author.id });
			/* Create the starboard post */
			newChannel.send(createStarpost(message, currentArchive))
				.then(async msg => {
					await msg.react('🌟');
					await msg.react('👍');
					await msg.react('😯');
					await msg.react('👌');
					await msg.react('💛');
					data.starboardId = msg.id;
					quickDb.set('archiveData_' + currentArchive, data);
				});
		})
		.catch(console.log);

	message.react(reaction);
}

bot.on('ready', () => {
	console.log('Bot is now live!');
	/* Get all previous messages and check if they have been scanned */
	const guild = bot.guilds.get(communityGuildId);

	if (guild && guild.available) {
		const submissionChannel = guild.channels.get(communitySubmissionChannelId);

		if (submissionChannel) {
			submissionChannel.fetchMessages()
				.then(pastMessages => pastMessages.filter(message => message.reactions.first().emoji.name == reaction && message.reactions.first().count < reactionsNeeded).forEach(message => addCollector(message)))
				.catch(console.error);
		}
	}
});

bot.on('message', message => {
	/* Check to see if it is a new submission */
	if (message.channel.id === communitySubmissionChannelId) {
		addCollector(message);
	}

	/* Generic commads */
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (bot.commands.get(command)) {
		bot.commands.get(command).execute(message, args);
	}
});

bot.login(process.env.BOT_TOKEN);
