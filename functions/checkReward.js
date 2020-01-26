module.exports = function(user) {
	const userEconomy = require('./getUserEcomony')(user);

	const now = Date.now();

	const nextRewardClaim = new Date(userEconomy.lastDailyRewardClaimTime + (1000 * 60 * 60 * 23.5)).getTime();
	const nextMessageClaim = new Date(userEconomy.lastMessageTime + (1000 * 60)).getTime();

	return [now, nextRewardClaim, now > nextRewardClaim, now > nextMessageClaim];
};