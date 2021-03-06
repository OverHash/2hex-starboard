const { starboardGuildId } = require('../config.json');
const isModerator = require('../functions/isModerator.js');
const createArchive = require('../functions/createArchive.js');

module.exports = {
	name: 'feature',
	description: 'Creates an archive',
	async execute(message, args) {
		if (!isModerator(message.member)) return message.channel.send('You are unable to use this command!').delete(2500);

		const newGuild = message.client.guilds.get(process.env.STARBOARDGUILDID || starboardGuildId);
		if (!newGuild) return console.error('Unable to get starboard guild!');

		const submissionId = args[0];

		message.channel.fetchMessage(submissionId)
			.then(submission => {
				createArchive(submission);
				message.delete();
			})
			.catch(err => {
				console.log(err);
				message.channel.send('Please set the first parameter as the submission message id')
					.then(msg => msg.delete(2500));
			});
	},
};