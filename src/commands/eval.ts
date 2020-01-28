import { Client, Message, MessageEmbed } from "discord.js"
import { inspect } from "util";
import { settings } from "../config";

const clean = (client: Client, text: string): string => {
	return text
		.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
		.replace(client.token || '', '[TOKEN]')
}

module.exports = {
	props: {},

	run: async (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => {
		let ev = clean(client, args.join(' '));

		let silent = false;
		let hide = false;

		if (hide) message.delete();
		let err = false;
		let evaled: string;
		try {
			evaled = await eval(ev);
			if (typeof evaled !== "string")
				evaled = inspect(evaled);
		} catch (e) {
			evaled = e.stack;
			err = true;
		}
		const embed = new MessageEmbed()
			.addField("Input", "```xl\n" + clean(client, ev) + "```")
			.addField("Output", "```xl\n" + clean(client, evaled).slice(0, 900) + "```")
			.setTimestamp();
		err ? embed.setColor(settings.colors.FAILED) : embed.setColor(settings.colors.SUCCESS);
		if (!silent) message.channel.send(embed);
	}
}

module.exports.props.data = {
	name: 'eval',
	description: 'Evaluate input using JavaScript',
	usage: ['!eval', '!help [javascript statemet]'],
	aliases: ['evaluate'],
	type: 'mod',
	hide: true
}