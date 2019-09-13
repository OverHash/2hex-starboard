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

const filter = react => react.emoji.name === (process.env.REACTION || reaction);
async function addCollector(message) {
	const newGuild = message.client.guilds.get(process.env.STARBOARDGUILDID || starboardGuildId);
	if (!newGuild) return console.error('Unable to get starboard guild!');
	const newChannel = await getStarboard(newGuild);
	if (!newChannel) return console.error('Unable to get starboard channel!');

	if (!((message.embeds[0] && (message.embeds[0].url || (message.embeds[0].image)) || (message.attachments.first())))) return;

	/* Create reaction collector */
	message.awaitReactions(filter, { max: (process.env.REACTIONSNEEDED || reactionsNeeded) })
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


					const embedMessage = new discord.RichEmbed()
						.setAuthor('Archives')
						.setTitle('Post archived!')
						.setColor('#4ceb34')
						.setDescription('Congratulations! 🎉\nThe community loved your post so much we decided to archive it in another discord server.')
						.addField('Jump to archive', '[jump](https://discordapp.com/channels/' + msg.guild.id + '/' + msg.channel.id + '/' + msg.id + ')', true)
						.addField('Invite to archive server', '[Invite](http://devarchives.xyz/archives)', true)

						.setTimestamp();

					message.author.send(embedMessage)
						.catch(console.error);

					message.react('✅');
				});
		})
		.catch(console.log);

	message.react(process.env.REACTION || reaction);
}

bot.on('ready', () => {
	console.log('Bot logged in as ' + bot.user.username + '#' + bot.user.discriminator + ' with id: ' + bot.user.id);
	console.log('Prefix: ' + (process.env.PREFIX || prefix))
	console.log('Reaction: ' + (process.env.REACTION || reaction))
	console.log('Reactions Needed: ' + (process.env.REACTIONSNEEDED || reactionsNeeded))
	console.log('LIST OF GUILDS AVAILABLE:' + bot.guilds.map(guild => '\n' + guild.name) + '\nEND OF GUILDS AVAILABLE')

	/* Get all previous messages and check if they have been scanned */
	const guild = bot.guilds.get(process.env.COMMUNITYGUILDID || communityGuildId);

	if (guild && guild.available) {
		const submissionChannel = guild.channels.get(process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId);

		if (submissionChannel) {
			submissionChannel.fetchMessages()
				.then(pastMessages => pastMessages.filter(message => ((!message.reactions.first()) || (message.reactions.first().emoji.name === (process.env.REACTION || reaction) && message.reactions.first().count < (process.env.REACTIONSNEEDED || reactionsNeeded)))).forEach(message => addCollector(message)))
				.catch(console.error);
		}
	} else {
		console.log("\x1b[37m\x1b[41m\x1b[1m" + 'GUILD NOT AVAILABLE. PLEASE CHECK THE ID FOR THE COMMUNITY GUILD' + "\x1b[0m");
	}

	console.log('submission channel ID: ' + (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId))
});

bot.on('message', message => {
	/* Check to see if it is a new submission */
	if (message.channel.id === (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId)) {
		addCollector(message);
	}

	/* Generic commads */
	if (!message.content.startsWith(process.env.PREFIX || prefix) || message.author.bot) return;
	const args = message.content.slice((process.env.PREFIX || prefix).length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (bot.commands.get(command)) {
		bot.commands.get(command).execute(message, args);
	}
});

if (!process.env.BOT_TOKEN) {
	return console.error('Please provide the bot token as the BOT_TOKEN enviromental variable')
}

bot.login(process.env.BOT_TOKEN)
	.catch(console.error);