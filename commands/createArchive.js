const quickDb = require('quick.db');

const { starboardGuildId } = require('../config.json');
const isModerator = require('../functions/isModerator.js');
const getStarboard = require('../functions/getStarboard.js');
const createStarpost = require('../functions/createStarpost.js');

module.exports = {
	name: 'createArchive',
	description: 'Creates an archive',
	async execute(message, args) {
		if (!isModerator(message.member)) return message.channel.send('You are unable to use this command!').delete(2500);

		const newGuild = message.client.guilds.get(process.env.STARBOARDGUILDID || starboardGuildId);
		if (!newGuild) return console.error('Unable to get starboard guild!');

		const newChannel = await getStarboard(newGuild);

		const submissionId = args[0];

		const submission = await message.channel.fetchMessage(submissionId);
		if (!submission) {
			return message.channel.send('Please set the first parameter as the submission message id');
		}

		const currentArchive = quickDb.add('currentArchive', 1);
		const data = quickDb.set('archiveData_' + currentArchive, { channel: submission.channel.id, guild: submission.guild.id, message: submission.id, date: new Date, authorId: submission.author.id });
		/* Create the starboard post */
		newChannel.send(createStarpost(submission, currentArchive))
			.then(async msg => {
				await msg.react('🌟');
				await msg.react('👍');
				await msg.react('😯');
				await msg.react('👌');
				await msg.react('💛');

				data.starboardId = msg.id;
				quickDb.set('archiveData_' + currentArchive, data);
			});
	},
};