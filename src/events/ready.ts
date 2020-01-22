import { settings } from "../config"
import { Client, RichEmbed, TextChannel } from "discord.js"

module.exports = (client: Client) => {
	if (settings.createReadyMessage) {
		console.log(`Logged in as ${client.user.tag} at ${new Date()}`)

		client.user.setActivity('devarchives', {
			type: 'WATCHING',
		})

		const readyEmbed = new RichEmbed()
			.setTitle(`${client.user.username} logged in!`)
			.setColor(settings.colors.SUCCESS)
			.setTimestamp();
		
		// we must do this as `get` can return nil, but also because it could be of wrong type. currently there is no API to get a channel of type
		const loggingChannelGet = client.channels.get(settings.readyMessageChannelId)
		if (!loggingChannelGet) throw 'Failed to get logging channel, check config.readyMessageChannelId'
		if (!(loggingChannelGet.type === 'text')) throw 'Logging channel is not of type text, check config.readyMessageChannelId'

		// get logging channel
		const loggingChannel = loggingChannelGet as TextChannel

		loggingChannel.send(readyEmbed);
	}
}