const quickdb = require('quick.db');

const { starboardGuildId } = require('../config.json');

const isModerator = require('../functions/isModerator.js');
const getStarboard = require('../functions/getStarboard.js');

module.exports = {
	name: 'deleteArchive',
	description: 'Deletes an archive given a archive number',
	async execute(message, args) {
		const archiveNumber = args[0];
		if (!isModerator) return message.channel.send('You must have kick permissions to use this command');
		if (!archiveNumber) return message.channel.send('Please specify an archive number');

		const archiveData = quickdb.get('archiveData_' + archiveNumber);
		if (!archiveData) {
			return message.channel.send('That archive doesn\'t exist!');
		}

		/* Delete the submission */
		message.client.guilds.get(archiveData.guild).channels.get(archiveData.channel).fetchMessage(archiveData.message)
			.then(msg => msg.delete());
		const starboard = await getStarboard(message.client.guilds.get(starboardGuildId));

		starboard.fetchMessage(archiveData.starboardId)
			.then(msg => msg.delete());

		quickdb.delete('archiveData_' + archiveNumber);
		message.channel.send('Archive deleted')
			.then(msg => msg.delete(2500));
	},
};