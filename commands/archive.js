const quickDb = require('quick.db');
const createStarpost = require('../functions/createStarpost');

const { starboardGuildId, starboardChannelId } = require('../config.json');


module.exports = {
	name: 'archive',
	description: 'Gets an archive',
	execute(message, args) {
		if (!args.size && !args[0] && !isNaN(args[0])) return message.channel.send('Please specify the archive number!');

		const data = quickDb.fetch('archiveData_' + args[0]);
		if (!data) return message.channel.send('I was unable to get that archive!');


		const messageGuild = message.client.guilds.get(data.guild)
		if (!messageGuild) return message.channel.send('Unable to get the guild the message was posted in');
		const messageChannel = messageGuild.channels.get(data.channel);
		if (!messageChannel) return message.channel.send('Unable to get the message channel');

		messageChannel.fetchMessage(data.message)
			.then(starPost => {
				message.channel.send(createStarpost(starPost, args[0]));
			})
			.catch(() => {
				message.channel.send('Unable to get the starpost!');
			});
	},
};