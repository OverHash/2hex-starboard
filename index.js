require('dotenv').config();
const discord = require('discord.js');
const quickDb = require('quick.db');

const { communityGuildId, starboardGuildId, communitySubmissionChannelId, starboardChannelId, reaction, reactionsNeeded } = require('./config.json');

const filter = (react, user) => react.emoji.name === reaction;

function addCollector(message) {
	/* Check if message is not already on the starboard */
	const messageId = message.id;

	const bot = message.client;
	const newGuild = bot.guilds.get(starboardGuildId);
	if (!newGuild) return console.error('Unable to get starboard guild!');
	const newChannel = newGuild.channels.get(starboardChannelId);
	if (!newChannel) return console.error('Unable to get starboard channel!');

	message.awaitReactions(filter, { max: reactionsNeeded })
		.then(() => {
			console.log(message.author.avatarURL.substr(0, message.author.avatarURL.length - 10));
			console.log(message.attachments.first().url);
			const starboardPost = new discord.RichEmbed()
				.setColor('#BBEAE9')
				.setTitle(message.author.username + '#' + message.author.discriminator, message.author.avatarURL.substr(0, message.author.avatarURL.length - 10))
				.setDescription(message.content)
				.setImage(message.attachments.first().url)

				.setTimestamp()
				.setFooter('Bot created by OverHash#6449');
			newChannel.send(starboardPost);
		})
		.catch(console.log);

	message.react(reaction);
}

const bot = new discord.Client();
bot.on('ready', () => {
	console.log('Bot is now live!');
	/* Get all previous messages and check if they have been scanned */
	const guild = bot.guilds.get(communityGuildId);

	if (guild && guild.available) {
		console.log('Community guild available');
		const submissionChannel = guild.channels.get(communitySubmissionChannelId);

		if (submissionChannel) {
			submissionChannel.fetchMessages()
				.then(pastMessages => pastMessages.filter(message => message.reactions.).forEach(message => addCollector(message)))
				.catch(console.error);
		}
	} else {
		console.log('Guild not available!');
	}
});

bot.on('message', message => {
	if (message.channel.id === communitySubmissionChannelId) {
		addCollector(message);
	}
});

bot.login(process.env.BOT_TOKEN);