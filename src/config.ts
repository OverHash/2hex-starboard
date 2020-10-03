export const settings = {
	// token/prefix
	token: process.env.token,
	prefix: "-",
	roleGivePrefix: '!',

	// command config
	modRoleId: '615022827334139905',

	// starboard stuff
	communityGuildId: '613587353084231730',
	starboardGuildId: '613587300655562762',
	communitySubmissionChannelId: '613587914911383559',
	reaction: '⭐',
	reactionsNeeded: process.env.test ? 2 : 6,

	// ready config
	createReadyMessage: true,
	readyMessageChannelId: '669013786233012262',

	// logging
	logging: {
		channelId: '669013786233012262',

		onMessageDeletedLog: true,
		onCommandRanLog: true
	},

	// colors
	colors: {
		"DEFAULT": "6d89ea",
		"SUCCESS": '43B581',
		"FAILED": 'fc5656',
		"HAZARD": 'fc9e3a'
	},
}