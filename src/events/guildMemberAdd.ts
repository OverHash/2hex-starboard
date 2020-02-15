import { Client, GuildMember } from "discord.js";

module.exports = (client: Client, member: GuildMember) => {
	const professions = member.guild.roles.cache.get('674373990789152829');
	const achievements = member.guild.roles.cache.get('674378904647237694');

	if (!professions) throw 'Couldn\'t get role by the name of professions';
	if (!achievements) throw 'Couldn\'t get role by the name of achievements';

	member.roles.add([professions, achievements], 'Default roles for joining server')
}