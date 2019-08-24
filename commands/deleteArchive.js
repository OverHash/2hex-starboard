const quickdb = require('quick.db');

const isModerator = require('../functions/isModerator.js');

module.exports = {
	name: 'deleteArchive',
	description: 'Deletes an archive given a archive number',
	execute(message, args) {
		const archiveNumber = args[0];
		if (!isModerator) return message.channel.send('You must have kick permissions to use this command');
		if (!archiveNumber) return message.channel.send('Please specify an archive number');

		const archiveData = quickdb.get('archiveData_' + archiveNumber);
		console.log(archiveData);
		if (!archiveData) {
			return message.channel.send('That archive doesn\'t exist!');
		}

		/* Delete the submission */		
		message.client.guilds.get(archiveData.guild).channels.get(archiveData.channel).fetchMessage(archiveData.message)
			.then(msg => msg.delete());

		quickdb.delete('archiveData_' + archiveNumber);
		message.channel.send('Archive deleted');
	},
};