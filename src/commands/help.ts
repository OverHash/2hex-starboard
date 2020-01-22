import { commandProps, commands } from "../Util/commands"
import { Client, Message, MessageEmbed, DMChannel } from "discord.js"
import { settings } from "../config";

module.exports = {
 	props: {},

	run: (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => {
		const commandOne = commands.get(args[0]);

		const noArgsEmbed = new MessageEmbed()
			.setTitle('Help Menu')
			.setDescription('<> = required, [] = optional\nRun `' + settings.prefix + 'help <command>` to view usage!')
			.setColor(settings.colors.DEFAULT)
			.setFooter(message.author.tag, message.author.displayAvatarURL())

		if (commandOne) {
			const commandData = new MessageEmbed()
				.setTitle(`**${commandOne.props.data.name}**`)
				.setColor(settings.colors.DEFAULT)
				.setFooter(message.author.tag, message.author.displayAvatarURL())
			
			const usage = commandOne.props.data.usage
				.join('\n')
				.replace(/!/g, settings.prefix);
			
			commandData.addField('Description', commandOne.props.data.description)
			commandData.addField('Usage', `\`${usage}\``)

			message.channel.send(commandData);
		} else {
			const sortedCommands = commands.clone().sort((a, b) => a.props.data.name.localeCompare(b.props.data.name))

			const filteredCommands: Array<commandProps> = [];
			for (const [_, item] of sortedCommands.entries()) {
				if (!filteredCommands.find(val => val.props.data.name === item.props.data.name)) {
					filteredCommands.push(item);
				}
			}

			noArgsEmbed.addField('Commands', filteredCommands.map(command => `${command.props.data.name} ➜ \`${command.props.data.usage[0]}\`\n`).join("").replace(/!/g, settings.prefix));

			message.author.send(noArgsEmbed);

			if (message.channel.type !== 'dm') {
				message.channel.send(new MessageEmbed()
					.setTitle('Help')
					.setDescription('I have sent you my list of commands, please check your DMs!')
					.setColor(settings.colors.DEFAULT)
					.setFooter(message.author.tag, message.author.displayAvatarURL()));
			}
		}
	}
} as commandProps

module.exports.props.data = {
	name: 'help',
	description: 'Describes bot command usage',
	usage: ['!help', '!help [command name]'],
	aliases: ['commands'],
	type: 'everyone',
}