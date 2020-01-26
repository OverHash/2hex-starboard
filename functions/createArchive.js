const quickDb = require('quick.db');
const discord = require('discord.js');

const { starboardGuildId } = require('../config.json');
const getStarboard = require('../functions/getStarboard.js');
const createStarpost = require('../functions/createStarpost.js');

module.exports = async function(message) {
	const currentArchive = quickDb.add('currentArchive', 1);
	const data = quickDb.set('archiveData_' + currentArchive, { channel: message.channel.id, guild: message.guild.id, message: message.id, date: new Date, authorId: message.author.id });
	/* Create the starboard post */

	const newGuild = message.client.guilds.get(process.env.STARBOARDGUILDID || starboardGuildId);
	if (!newGuild) return console.error('Unable to get starboard guild!');

	const newChannel = await getStarboard(newGuild);
	if (!newChannel) return console.error('Unable to get starboard channel!');

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

				.setTimestamp()
				.setFooter('Archive ID ' + currentArchive);

			message.author.send(embedMessage)
				.catch(() => {
					console.log('Unable to DM ' + message.author.username);
				});

			message.react('✅');
		});
};