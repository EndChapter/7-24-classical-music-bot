import {
	Client as ErisClient,
} from 'eris';
import { bottok } from '../../config';
import interactionCreate from './listeners/on/interactionCreate';
import ready from './listeners/once/ready';
import sendConnection from './listeners/other/sendConnection';

export default class Client {
	private static _client: ErisClient;

	// Inspired from https://github.com/Member-Counter/bot Yo respect to your code man this is so perfect. Also I cant steal all code I can just inspire from your client use.
	static init() {
		const client = new ErisClient(bottok, {
			allowedMentions: {
				everyone: false,
			},
			intents: ['allNonPrivileged', 'guildMembers'],
			largeThreshold: 0,
			maxResumeAttempts: 1000,
			disableEvents: {
				CHANNEL_CREATE: true,
				CHANNEL_DELETE: true,
				CHANNEL_UPDATE: true,
				GUILD_BAN_ADD: true,
				GUILD_BAN_REMOVE: true,
				GUILD_MEMBER_ADD: true,
				GUILD_MEMBER_REMOVE: true,
				GUILD_MEMBER_UPDATE: true,
				GUILD_ROLE_CREATE: true,
				GUILD_ROLE_DELETE: true,
				GUILD_ROLE_UPDATE: true,
				GUILD_UPDATE: true,
				MESSAGE_DELETE: true,
				MESSAGE_DELETE_BULK: true,
				MESSAGE_UPDATE: true,
				PRESENCE_UPDATE: true,
				TYPING_START: true,
				USER_UPDATE: true,
			},
			seedVoiceConnections: true,
		});
		client.once('ready', ready);
		client.on('interactionCreate', interactionCreate);
		client.on('voiceChannelJoin', sendConnection);
		client.on('voiceChannelLeave', sendConnection);
		client.on('voiceChannelSwitch', sendConnection);
		client.connect();

		this._client = client;
	}

	static get client(): ErisClient {
		return this._client;
	}
}
