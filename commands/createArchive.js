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

		message.channel.fetchMessage(submissionId)
			.then(submission => {
				const currentArchive = quickDb.add('currentArchive', 1);
				const data = quickDb.set('archiveData_' + currentArchive, { channel: submission.channel.id, guild: submission.guild.id, message: submission.id, date: new Date, authorId: submission.author.id });
				/* Create the starboard post */
				newChannel.send(createStarpost(submission, currentArchive))
					.then(async msg => {
						message.channel.send('Post archived', msg.embeds[0])
							.then(notifier => notifier.delete(2500));
						message.delete();

						await msg.react('🌟');
						await msg.react('👍');
						await msg.react('😯');
						await msg.react('👌');
						await msg.react('💛');

						data.starboardId = msg.id;
						quickDb.set('archiveData_' + currentArchive, data);
					});
			})
			.catch(err => {
				console.log(err);
				message.channel.send('Please set the first parameter as the submission message id')
					.then(msg => msg.delete(2500))
			})
	},
};