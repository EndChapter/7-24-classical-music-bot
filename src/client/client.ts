import {
	Client as _Client,
} from 'eris';
// TODO: Logger winston
// import winston from 'winston';
import Listeners from './listeners';
import { bottok } from '../../config';

interface clientIF{
	client: _Client;
	connect: () => void;
}
export default class Client implements clientIF {
	client: _Client;

	listeners: Listeners;

	constructor() {
		this.client = new _Client(bottok, {
			allowedMentions: {
				everyone: false,
			},
			connectionTimeout: Infinity,
			// ! Edit intents after finished bot.
			intents: ['guildVoiceStates', 'guildMembers'],
			// This is only a music bot. Thus, I need to disable other events for performance increase.
			disableEvents: {
				CHANNEL_CREATE: true,
				CHANNEL_DELETE: true,
				CHANNEL_UPDATE: true,
				GUILD_BAN_ADD: true,
				GUILD_BAN_REMOVE: true,
				// GUILD_CREATE: true,
				// GUILD_DELETE: true,
				GUILD_MEMBER_ADD: true,
				GUILD_MEMBER_REMOVE: true,
				GUILD_MEMBER_UPDATE: true,
				GUILD_ROLE_CREATE: true,
				GUILD_ROLE_DELETE: true,
				GUILD_ROLE_UPDATE: true,
				GUILD_UPDATE: true,
				// MESSAGE_CREATE: true,
				MESSAGE_DELETE: true,
				MESSAGE_DELETE_BULK: true,
				MESSAGE_UPDATE: true,
				PRESENCE_UPDATE: true,
				TYPING_START: true,
				USER_UPDATE: true,
				// VOICE_STATE_UPDATE: true,
			},
			// I dont want to cache offline people(or any people). Thus..
			largeThreshold: 0,
			maxResumeAttempts: Infinity,
			// requestTimeout: Infinity,
			// restMode: true
			seedVoiceConnections: true,
		});
		this.listeners = new Listeners(this.client);
	}

	async connect() {
		await this.listeners.initialize();
		this.client.connect();
	}
}
