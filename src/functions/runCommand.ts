import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import { settings } from "../config";
import { commands } from "../Util/commands";

export = (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => {
	const commandsShifted = args.shift();
	const commandRequested = commandsShifted ? commandsShifted.toLowerCase() : '';

	const command = commands.get(commandRequested);
	if (!command) return;
	if (!(message.channel.type === 'dm' && message.member)) return;
	
	const invalidPermission = new MessageEmbed()
		.setColor(settings.colors.FAILED)
		.setTitle('Invalid Permissions')
		.setDescription('You do not have permission to use this command.')
		.setFooter(message.author.tag, message.author.displayAvatarURL())
	
	const commandRanEmbed = new MessageEmbed()
		.setColor(settings.colors.SUCCESS)
		.setTitle('Command usage')
		.setDescription(command.props.data.name + ' was ran!\n\nClick [here](' + message.url + ') to jump to message')
		.setAuthor(message.author.username, message.author.displayAvatarURL())
		.setTimestamp()
		.setFooter(message.author.tag, message.author.displayAvatarURL())
	

	if (command.props.data.type === 'mod') {
		if (!message.member.roles.get(settings.modRoleId)) return message.channel.send(invalidPermission);
	}

	if (settings.logging.onCommandRanLog) {
		// we must do this as `get` can return nil, but also because it could be of wrong type. currently there is no API to get a channel of type
		const loggingChannelGet = client.channels.get(settings.readyMessageChannelId)
		if (!loggingChannelGet) throw 'Failed to get logging channel, check config.readyMessageChannelId'
		if (!(loggingChannelGet.type === 'text')) throw 'Logging channel is not of type text, check config.readyMessageChannelId'

		// get logging channel
		const loggingChannel = loggingChannelGet as TextChannel

		loggingChannel.send(commandRanEmbed)
	}

	try {
		command.run(client, message, args, errorFunction);
	} catch (err) {
		console.log(err);
	}
}