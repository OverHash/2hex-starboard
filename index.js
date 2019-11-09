require('dotenv').config();
const fs = require('fs');
const path = require('path');
const discord = require('discord.js');
const msgEmbedToRich = require('discordjs-embed-converter');

const { prefix, roleGivePrefix, communityGuildId, communitySubmissionChannelId, commandChannel, reaction, reactionsNeeded } = require('./config.json');

const addRole = require('./functions/addRole');
const checkReward = require('./functions/checkReward');
const createArchive = require('./functions/createArchive');
const getUserEconomy = require('./functions/getUserEcomony');

const economyPath = 'economy.json';


const bot = new discord.Client();
bot.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	bot.commands.set(command.name.toLowerCase(), command);
}

bot.on('ready', () => {
	console.log('Bot logged in as ' + bot.user.username + '#' + bot.user.discriminator + ' with id: ' + bot.user.id);
	console.log('Prefix: ' + (process.env.PREFIX || prefix));
	console.log('Role give prefix: ' + (process.env.ROLEGIVEPREFIX || roleGivePrefix));
	console.log('Reaction: ' + (process.env.REACTION || reaction));
	console.log('Reactions Needed: ' + (process.env.REACTIONSNEEDED || reactionsNeeded));
	console.log('LIST OF GUILDS AVAILABLE:' + bot.guilds.map(guild => '\n' + guild.name) + '\nEND OF GUILDS AVAILABLE');

	/* Get all previous messages and check if they have been scanned */
	const guild = bot.guilds.get(process.env.COMMUNITYGUILDID || communityGuildId);

	if (guild && guild.available) {
		const submissionChannel = guild.channels.get(process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId);

		if (submissionChannel) {
			submissionChannel.fetchMessages()
				.then(pastMessages => pastMessages.filter(message => (message.attachments.first() || (message.embeds[0] && (message.embeds[0].image || message.embeds[0].video || message.embeds[0].thumbnail)))).forEach(message => message.react(process.env.REACTION || reaction)))
				.catch(console.error);
		}
	} else {
		console.log('\x1b[37m\x1b[41m\x1b[1m' + 'GUILD NOT AVAILABLE. PLEASE CHECK THE ID FOR THE COMMUNITY GUILD' + '\x1b[0m');
	}

	console.log('submission channel ID: ' + (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId));
});

bot.on('message', async message => {
	/* Check for money */
	if (checkReward(message.author)[3] && !message.author.bot) {
		// user can claim a reward
		const economy = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));
		const userEconomny = getUserEconomy(message.author);

		userEconomny.balance += Math.floor(Math.random() * (15 - 5)) + 5;
		userEconomny.lastMessageTime = Date.now();

		economy[economy.findIndex(data => data.id === userEconomny.id)] = userEconomny;

		fs.writeFileSync(economyPath, JSON.stringify(economy, null, 4));
	}

	/* Check to see if it is a new submission */
	if (message.channel.id === (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId)) {
		const attachment = message.attachments.first();
		const embed = message.embeds[0];

		if (attachment) {
			message.react(process.env.REACTION || reaction);
		} else if (embed && (embed.image || embed.video || embed.thumbnail)) {
			message.react(process.env.REACTION || reaction);
		}
	}

	/* Check to see if it is a role give */
	if (message.content.startsWith(process.env.ROLEGIVEPREFIX || roleGivePrefix) && !message.author.bot) {
		addRole(message);
	}

	// check to see if it is a response to an embed create
	const currentEmbeds = JSON.parse(fs.readFileSync(path.resolve(__dirname, './markedEmbeds.json')));
	for (const k in currentEmbeds) {
		const embed = currentEmbeds[k];

		if (embed.author === message.author.id && embed.status && embed.channelId === message.channel.id) {
			message.channel.fetchMessage(embed.id)
				.then(async embedMsg => {
					const oldEmbed = embedMsg.embeds[0];
					const newEmbed = msgEmbedToRich(oldEmbed);

					let changedSomething = false;
					let newDeleteMsg = null;
					// create fields
					if (embed.status === '🅰') {
						// title
						newEmbed.setTitle(message.content);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '🌈') {
						// color
						newEmbed.setColor(message.content);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '🔗') {
						// url
						newEmbed.setURL(message.content);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '👣') {
						// footer
						newEmbed.setFooter(message.content);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '🕖') {
						// timestamp
						if (message.content === 'on') {
							newEmbed.setTimestamp();
						} else {
							newEmbed.setTimestamp(0);
						}
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '📧') {
						// description
						newEmbed.setDescription(message.content);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '🇫') {
						// edit field
						if (message.content === 'create') {
							newEmbed.addField('New Field', 'New Field Description');
							currentEmbeds[k].status = null;
							const msg = await message.channel.send('Created field with id ' + (newEmbed.fields.length - 1));
							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
						} else if (message.content === 'delete') {
							currentEmbeds[k].status = 'deleteFieldId';
							const msg = await message.channel.send('Please specify what field ID you want to delete');

							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
						} else if (message.content === 'edit') {
							currentEmbeds[k].status = 'editFieldId';
							const msg = await message.channel.send('Please specify what field ID you want to edit');

							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
							changedSomething = true;
						}
					} else if (embed.status === 'deleteFieldId') {
						newEmbed.fields.splice(parseInt(message.content), 1);
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === 'editFieldId') {
						currentEmbeds[k].fieldEditId = parseInt(message.content);
						currentEmbeds[k].status = 'editFieldData';
						const msg = await message.channel.send('"title" to edit the field title, "content" to edit the field content, "inline" to toggle inline');

						// eslint-disable-next-line require-atomic-updates
						newDeleteMsg = msg.id;
						changedSomething = true;
					} else if (embed.status === 'editFieldData') {
						if (message.content === 'title') {
							currentEmbeds[k].status = 'editFieldTitle';
							const msg = await message.channel.send('Enter field title');

							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
						} else if (message.content === 'content') {
							currentEmbeds[k].status = 'editFieldDescription';
							const msg = await message.channel.send('Enter field description');

							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
						} else if (message.content === 'inline') {
							currentEmbeds[k].status = 'editFieldInline';
							const msg = await message.channel.send('Type "yes" for inline, "no" for not inline');

							// eslint-disable-next-line require-atomic-updates
							newDeleteMsg = msg.id;
						}
						changedSomething = true;
					} else if (embed.status === 'editFieldTitle') {
						newEmbed.fields[embed.fieldEditId].name = message.content;
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === 'editFieldDescription') {
						newEmbed.fields[embed.fieldEditId].value = message.content;
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === 'editFieldInline') {
						newEmbed.fields[embed.fieldEditId].inline = message.content === 'yes' ? true : false;
						currentEmbeds[k].status = null;
						changedSomething = true;
					} else if (embed.status === '✅') {
						// confirm
						if (message.content === 'confirm') {
							currentEmbeds[k].status = 'getChannel';
							message.channel.send('Please mention the channel you wish to send the embed to');
						}
						changedSomething = true;
					} else if (embed.status === 'getChannel') {
						// sending embed
						message.mentions.channels.first().send(newEmbed);
						message.channel.send('Sent embed to that channel');
						currentEmbeds.splice(k, 1);
					} else if (embed.status === '🗑') {
						// delete embed
						currentEmbeds.splice(k, 1);
						message.channel.send('Cancelled embed creation.');
						changedSomething = true;
					}

					// write to old embed
					embedMsg.edit(embedMsg.content, newEmbed)
						.then()
						.catch();

					// delete msg (maybe)
					if (changedSomething && currentEmbeds[k] && currentEmbeds[k].deleteMsg) {
						message.channel.fetchMessage(currentEmbeds[k].deleteMsg)
							.then((msg) => {
								msg.delete()
									.catch();
								if (newDeleteMsg) {
									currentEmbeds[k].deleteMsg = newDeleteMsg;
								}
							})
							.catch();
					}


					// delete info messages
					if (embed.infoMessage) {
						await message.channel.fetchMessage(embed.infoMessage)
							.then(async msg => msg.delete()
								.then(() => embed.infoMessage = null)
								.catch())
							.catch();
					}

					if (message.content === 'cancel') {
						// eslint-disable-next-line require-atomic-updates
						currentEmbeds[k].status = null;
					}

					message.delete()
						.catch(console.warn);

					// save
					fs.writeFileSync(path.resolve(__dirname, './markedEmbeds.json'), JSON.stringify(currentEmbeds, null, 4));
				})
				.catch(err => console.log('Error related to embeds: ' + err));
		}
	}

	/* Generic commads */
	if (!message.content.startsWith(process.env.PREFIX || prefix) || message.author.bot) return;
	const args = message.content.slice((process.env.PREFIX || prefix).length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (bot.commands.get(command)) {
		if ((bot.commands.get(command).requiresCommandChannel && message.channel.id === commandChannel) || !bot.commands.get(command).requiresCommandChannel) {
			bot.commands.get(command).execute(message, args);
		}
	}
});

const reactionMessages = {
	'🅰': 'Enter new title of the embed',
	'🌈': 'Enter the hex code color of the embed',
	'🔗': 'Enter the URL the embed refers to',
	'👣': 'Enter the footer text',
	'🕖': 'Type \'on\', to turn on, \'off\', to turn off',
	'📧': 'Enter embed description',
	'🇫': 'Type \'create\' to create embed field, \'delete\' to delete embed field, \'edit\' to edit embed field',
	'✅': 'Type \'confirm\' to confirm create embed',
	'🗑': 'Type \'confirm\' to confirm delete embed',
};

const fields = {
	'🅰': 'the title',
	'🌈': 'the embed color',
	'🔗': 'the embed link',
	'👣': 'the embed footer',
	'🕖': 'the embed timestamp',
	'📧': 'the description',
	'🇫': 'an embed field',
	'✅': 'the embed confirmation',
	'🗑': 'the embed delete status',
};

bot.on('messageReactionAdd', async (react, user) => {
	const message = react.message;
	/* Check to see if it is a submission */
	if (message.channel.id === (process.env.COMMUNITYSUBMISSIONCHANNELID || communitySubmissionChannelId)) {
		/* Check to see if the message has already surpassed the required threshold */
		if ((react.count >= (process.env.REACTIONSNEEDED || reactionsNeeded)) && !(message.reactions.filter(obj => obj.emoji.name === '✅').first())) {
			/* message can be posted */
			createArchive(message);
		}
	}

	// check to see if it is a embed submission
	const currentEmbeds = JSON.parse(fs.readFileSync(path.resolve(__dirname, './markedEmbeds.json')));
	for (const k in currentEmbeds) {
		if (currentEmbeds[k].id === message.id && user !== bot.user) {
			// check to see if the user is already doing something
			if (currentEmbeds[k].status) {
				return message.channel.send('You are already editing ' + fields[currentEmbeds[k].status] + '. Please type \'cancel\' to cancel editing that field.')
					.then((msg) => msg.delete(1000 * 3))
					.then(() => react.remove(user));
			}
			if (reactionMessages[react.emoji.name]) {
				// assign status
				currentEmbeds[k].status = react.emoji.name;

				// create & assign the "info" message
				const msg = await message.channel.send(user + ', ' + reactionMessages[react.emoji.name]);
				currentEmbeds[k].infoMessage = msg.id;

				fs.writeFileSync(path.resolve(__dirname, './markedEmbeds.json'), JSON.stringify(currentEmbeds, null, 4));

				// remove reaction
				react.remove(user);
			}
		}
	}

});

if (!process.env.BOT_TOKEN) {
	console.error('Please provide the bot token as the BOT_TOKEN enviromental variable');
	process.exit();
}

bot.login(process.env.BOT_TOKEN)
	.catch(console.error);