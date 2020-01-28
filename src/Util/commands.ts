import { Collection, Client, Message } from "discord.js";
import fs = require('fs');
import path = require("path");

export type commandProps = {
	props: {
		data: {
			aliases: Array<string>,
			type: 'mod' | 'everyone',
			name: string,
			description: string,
			usage: Array<string>,
			hide?: boolean
		}
	},

	run: (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => void;
}

export const commands: Collection<string, commandProps> = new Collection()

fs.readdir(path.join(__dirname, '../commands/'), (err, files) => {
	if (err) return console.log(err);

	files.forEach(file => {
		if (!file.endsWith('.js')) return;

		const command: commandProps = require(path.join(__dirname, '../commands/') + file);
		const name = file.split('.')[0];

		commands.set(name, command)

		// check for aliases for this command
		for (const alias of command.props.data.aliases) {
			commands.set(alias, command)
		}
	})
})