import { Client, Message, TextChannel, MessageEmbed } from "discord.js";
import { settings } from "../config";
import runCommand = require("../functions/runCommand")

module.exports = (client: Client, message: Message) => {
	if (message.author.bot) return;
	if (!client.user) return;

	// check to see if its command
	const prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`].concat(settings.prefix);
	let prefix: boolean | string = false;
	for (const p of prefixes) message.content.startsWith(p) ? prefix = p : null;
	if (!prefix) return;

	const args = message.content.slice(prefix.length).trim().split(' ');

	function error(text: string) {
		const embed = new MessageEmbed()
			.setTitle('An error has occured')
			.addField('Information', text)
			.setColor(settings.colors.FAILED)
		
		// we must do this as `get` can return nil, but also because it could be of wrong type. currently there is no API to get a channel of type
		const loggingChannelGet = client.channels.cache.get(settings.readyMessageChannelId);
		if (!loggingChannelGet) throw 'Failed to get logging channel, check config.logging.channelId';
		if (!(loggingChannelGet.type === 'text')) throw 'Logging channel is not of type text, check config.logging.channelId';

		// get logging channel
		const loggingChannel = loggingChannelGet as TextChannel;
		
		return loggingChannel.send(embed);
	}

	runCommand(client, message, args, error)
}