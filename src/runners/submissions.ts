import { Client, TextChannel, Message, MessageReaction, User } from "discord.js";
import { settings } from "../config";
import database = require("../Util/database");
import createArchive = require("../Util/createArchive");
import { archivesGetResponse, messageCacheGetResponse } from "../Util/databaseTypings";

function messageHasContent(message: Message): boolean {
	const content = message.attachments.first();

	if (content) {
		// check to see for first video
		return true;
	}

	const embed = message.embeds[0];
	if (embed) {
		return true;
	}


	return false;
}

async function newMessage(message: Message): Promise<void> {
	// check if we have already done this message
	const currentReacts = message.reactions.cache.get(settings.reaction);
	if (currentReacts && currentReacts.me) {
		// check to see if this should be posted in the archive server
		const data = await database.get<archivesGetResponse>(`SELECT * from archives WHERE messageId='${message.id}'`)
		if (data) {
			// it's an old message, discard
			return;
		} else {
			// check to see if they pass the required amount of reactions!
			const users = await currentReacts.users.fetch()
			if (users.size >= settings.reactionsNeeded) {
				const archiveMessage = await createArchive(message);

				database.run(`INSERT INTO archives (messageId, archiveMessageId, authorId) VALUES ('${message.id}', '${archiveMessage.id}', '${archiveMessage.author.id}');`);
			}
		}
		return;
	}

	let data = await database.get<messageCacheGetResponse>('SELECT * from messageCache WHERE id = 1')
	if (!data) {
		data = { messageId: message.id, id: 1 }
		await database.run(`INSERT INTO messageCache (messageId) VALUES ('${message.id}');`);
	}

	const cacheTime = (parseInt(message.id) / 4194304);
	const currentTime = (parseInt(message.id) / 4194304);

	if (currentTime >= cacheTime) {
		// new message since the cache
		if (messageHasContent(message)) {
			// react!
			message.react(settings.reaction);
		}
	}

	// store in db
	await database.run(`UPDATE messageCache SET messageId = '${message.id}' WHERE id = 1;`);
}

module.exports = [
	{
		name: 'ready',
		run: (client: Client) => {
			const mainGuild = client.guilds.cache.get(settings.communityGuildId);

			if (!(mainGuild && mainGuild.available)) return console.log(settings.communityGuildId + ' was not found!');

			const submissionChannelGet = mainGuild.channels.cache.get(settings.communitySubmissionChannelId);
			if (!submissionChannelGet) return console.log(settings.communitySubmissionChannelId + ' was not found!');
			if (!(submissionChannelGet.type === 'text')) return console.log('community submission channel is not of type text, please check configuration file.');

			const submissionChannel = submissionChannelGet as TextChannel;

			database.get<messageCacheGetResponse>('SELECT * from messageCache')
				.then(lastMessageData => {
					submissionChannel.messages.fetch({
						after: lastMessageData ? lastMessageData.messageId : undefined
					})
						.then(messages => {
							messages.forEach(message => {
								newMessage(message);
							})
						})
						.catch()
				})
				.catch(err => console.log('Failed to get last cached message for submissions because\n' + err));
		}
	},
	{
		name: 'message',
		run: (client: Client, message: Message) => {
			if (message.channel.id === settings.communitySubmissionChannelId) {
				newMessage(message);
			}
		}
	},
	{
		name: 'messageUpdate',
		run: (client: Client, oldMessage: Message, updatedMessage: Message) => {
			if (updatedMessage.reactions.cache.get(settings.reaction)) return;

			newMessage(updatedMessage);
		}
	},
	{
		name: 'messageReactionAdd',
		run: async (client: Client, messageReaction: MessageReaction, user: User) => {
			if (messageReaction.partial) {
				await messageReaction.fetch();
				await messageReaction.message.fetch();
			}
			newMessage(messageReaction.message);
		}
	}
]