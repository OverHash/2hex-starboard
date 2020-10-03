export type archivesGetResponse = {
	archiveId: number,
	messageId: string,
	archiveMessageId: string,
	authorId: string
}

export type messageCacheGetResponse = {
	id: number,
	messageId: string
}

export type economyGetResponse = {
	economyId: number,
	authorId: string,
	balance: number,
	lastDailyRewardClaimTime: string,
	lastMessageTime: string
}