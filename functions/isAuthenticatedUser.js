/**
 * 
 * @param guildMember GuildMember
 * @returns boolean
 */
module.exports = function(guildMember) {
	// community rep, social media rep
	return guildMember.hasPermission('KICK_MEMBERS') || guildMember.roles.has(501584776180924416) || guildMember.roles.has(501585377228750849)
}