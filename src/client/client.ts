import axios from 'axios';
import type { ApplicationCommand, ApplicationCommandStructure, VoiceConnection as VoiceConnectionT } from 'eris';
import {
	AutocompleteInteraction, Client as _Client, Constants, CommandInteraction, ComponentInteraction,
	InteractionDataOptionWithValue, Member, PingInteraction, VoiceChannel, VoiceConnection,
} from 'eris';
import youtubeDlExec from 'youtube-dl-exec';
import type { listeners } from './interfaces/listeners.if';
import { bottok, databaseURL } from '../../config';

// !
// IMPORTANT: Add cache for reloading links
// !
// TODO fix channels cache.
export default class Client implements listeners {
	client: _Client;

	static playVoice(memberCount: number, connection: VoiceConnectionT, channelID: string) {
		let activeVoiceChannel = false;
		let privateKey = '';
		axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
			if (response.data !== null) {
				Object.keys(response.data).forEach((key) => {
					const cachedChannelID = response.data[key].channelID;
					if (cachedChannelID === channelID) {
						activeVoiceChannel = true;
						privateKey = key;
					}
				});
			}
		}).catch((_err) => {
			// log
		});
		if (memberCount > 1) {
			// Update here after finished
			if (!activeVoiceChannel) {
				axios.post(`${databaseURL}/activeConnections.json`, {
					channelID,
					timestamp: Date.now(),
				});
				youtubeDlExec('https://www.youtube.com/watch?v=sGHgBP9-zXo', {
					dumpSingleJson: true,
					noCheckCertificates: true,
					noWarnings: true,
					preferFreeFormats: true,
					audioFormat: 'mp3',
					addHeader: [
						'referer:youtube.com',
						'user-agent:googlebot',
					],
				}).then(async (response) => {
					if (connection.playing) {
						await connection.stopPlaying();
					}
					if (response.formats[2]) {
						await connection.play(response.formats[2].url, {
						// -1 Means no timeout
							voiceDataTimeout: -1,
						});
					}
					else {
						console.log('there is a problem with getting formats.');
					}
				}).catch((_err) => {
				// Log
				});
			}
		}
		else if (!activeVoiceChannel) {
			axios.delete(`${databaseURL}/activeConnections/${privateKey}.json`);
		}
	}

	async ready() {
		// P means Play
		const commandNames = ['play', 'classical', 'stop'];
		const commandPlay : (commandName: string) => ApplicationCommandStructure = (commandName: string) => ({
			name: commandName,
			description: 'Plays 7/24 classical music in your voice channel.',
			options: [{
				name: 'channel',
				type: Constants.ApplicationCommandOptionTypes.STRING,
				description: 'Channel or Channel ID for playing classical music.',
				required: false,
			}],
			type: 1,
		});
		const commandStop: ApplicationCommandStructure = {
			name: 'stop',
			description: 'Stops the music.',
			type: 1,
		};
		// Initialize voice

		const threeMinutes = 180000;
		const thirstyMinutes = 1800000;
		// In every 45 minutes. Live link become expired. So I will avoid with that.
		// TODO: Change link 1 time apply every check.
		setInterval(() => {
			(this as unknown as _Client).voiceConnections.forEach((connection: VoiceConnection) => {
				axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
					if (response.data !== null) {
						Object.keys(response.data).forEach((key) => {
							if (Date.now() - thirstyMinutes > response.data[key].timestamp) {
								const cachedChannel = (this as unknown as _Client).getChannel(response.data[key].channelID) as VoiceChannel;
								Client.playVoice(cachedChannel.voiceMembers.size, connection, response.data[key].channelID);
							}
						});
					}
				}).catch((_err) => {
					// log
				});
			});
		}, threeMinutes);

		// Initialize voice

		const commands = await (this as unknown as _Client).getCommands();
		commandNames.forEach((commandName: string) => {
			let commandExist = false;
			commands.forEach((command: ApplicationCommand) => {
				if (commandName === command.name) {
					commandExist = true;
				}
			});
			if (!commandExist) {
				if (commandName === 'stop') {
					(this as unknown as _Client).createCommand(commandPlay(commandName));
				}
				else {
					(this as unknown as _Client).createCommand(commandStop);
				}
			}
		});
		// This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
		axios.get(`${databaseURL}/channels.json`).then((response) => {
			if (response.data === null) {
				return;
			}
			Object.keys(response.data).forEach((key) => {
				const { channelID } = response.data[key];
				(this as unknown as _Client).joinVoiceChannel((channelID as string), { selfDeaf: true }).then(async (connection) => {
					const memberCount = (await (this as unknown as _Client).getChannel((channelID as string)) as VoiceChannel).voiceMembers.size;
					Client.playVoice(memberCount, connection, channelID);
				}).catch((err) => console.error(err));
			});
		}).catch((_err) => {
			// log
		});
		const Guilds = (this as unknown as _Client).guilds.map((guildd) => guildd.name);
		console.log(`INFO: Connected \`[${Guilds.join(', ')}]\` guilds!`);
	}

	interactionCreate(interaction: PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction) {
		if (interaction instanceof CommandInteraction) {
			let value = '';
			if (interaction.data) {
				if (interaction.data.options) {
					if (interaction.data.options[0]) {
						value = (interaction.data.options[0] as InteractionDataOptionWithValue).value as string;
					}
				}
			}
			if (interaction.data.name === 'play' || interaction.data.name === 'classical') {
				let guildID = '';
				let channelID: string;
				if (value !== '') {
					const channelRegex = /<#[0-9]{18,19}>/;
					const numberRegex = /[0-9]{18,19}/;
					if (channelRegex.test(value)) {
						const valueArr = value.split('');
						valueArr.pop();
						valueArr.shift();
						valueArr.shift();
						channelID = valueArr.join('');
					}
					else if (numberRegex.test(value)) {
						channelID = value;
					}
					else {
						// log and message
						return;
					}
				}
				else if (interaction.member) {
					if (interaction.member.voiceState !== undefined) {
						if (interaction.member.voiceState.channelID !== null) {
							channelID = interaction.member.voiceState.channelID;
							guildID = interaction.member.guild.id;
						}
						else {
							// log and message
							return;
						}
					}
					else {
						// log and message
						return;
					}
				}
				else {
					// log and message
					return;
				}

				const channel = (this as unknown as _Client).getChannel(channelID);
				if (!(channel instanceof VoiceChannel)) {
					// log and message
					return;
				}
				// Checking for if the guild cached before.
				axios.get(`${databaseURL}/channels.json`).then((response) => {
					if (response.data === null) {
						return;
					}
					Object.keys(response.data).forEach((key) => {
						// !
						// IMPORTANT: Add cache for reloading links
						// !
						// TODO fix channels cache.
						const cachedChannel = (this as unknown as _Client).getChannel(response.data[key].channelID) as VoiceChannel;
						if (cachedChannel.guild.id === channel.guild.id) {
							axios.delete(`${databaseURL}/channels/${key}.json`);
						}
					});
				}).catch((_err) => {
					// log
				});
				axios.post(`${databaseURL}/channels.json`, {
					channelID,
					guildID,
				});
				(this as unknown as _Client).joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
					const memberCount = (await (this as unknown as _Client).getChannel(channelID) as VoiceChannel).voiceMembers.size;
					Client.playVoice(memberCount, connection, channelID);
				}).catch((err) => console.error(err));
				interaction.createMessage({
					content: '**Thanks for using classical bot.** ❤️',
					flags: 64,
				});
			}
			else if (interaction.data.name === 'stop') {
				if (interaction.member) {
					const guildID = interaction.member.guild.id;
					axios.get(`${databaseURL}/channels.json`).then((response) => {
						if (response.data === null) {
							// Probably there is a error somewhere log this.
							return;
						}
						Object.keys(response.data).forEach((key) => {
							if (guildID === response.data[key].guildID) {
								const connection = (this as unknown as _Client).voiceConnections.get(response.data[key].guildID);
								if (connection) {
									connection.stopPlaying();
									connection.disconnect();
								}
								axios.delete(`${databaseURL}/channels/${key}.json`);
								axios.get(`${databaseURL}/activeConnections.json`).then((rs) => {
									if (rs.data !== null) {
										Object.keys(rs.data).forEach((rsKey) => {
											if (rs.data[rsKey] === response.data[key].channelID) {
												axios.delete(`${databaseURL}/activeConnections/${rsKey}.json`);
											}
										});
									}
								}).catch((_err) => {
									// log
								});
							}
						});
					}).catch((_err) => {
						// log
					});
					interaction.createMessage({
						content: '**Thanks for using classical bot.** ❤️',
						flags: 64,
					});
				}
			}
			else {
				// log
			}
		}
	}

	async voiceChannelJoin(_member: Member, channel: VoiceChannel) {
		const connection = await (this as unknown as _Client).voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Client.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}

	async voiceChannelLeave(_member: Member, channel: VoiceChannel) {
		const connection = await (this as unknown as _Client).voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Client.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}

	async voiceChannelSwitch(_member: Member, channel: VoiceChannel) {
		const connection = await (this as unknown as _Client).voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Client.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}

	connect() {
		this.client.connect();
	}

	constructor() {
		this.client = new _Client(bottok, {
			allowedMentions: {
				everyone: false,
			},
			// ! Edit intents after finished bot.
			intents: ['allNonPrivileged', 'guildMembers'],
			// I dont want to cache offline people(or any people). Thus..
			largeThreshold: 0,
			maxResumeAttempts: 1000,
			// requestTimeout: 30000,
			// restMode: true
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
			seedVoiceConnections: true,
		});
		this.client.once('ready', this.ready);
		this.client.on('interactionCreate', this.interactionCreate);
		this.client.on('voiceChannelJoin', this.voiceChannelJoin);
		this.client.on('voiceChannelLeave', this.voiceChannelLeave);
		this.client.on('voiceChannelSwitch', this.voiceChannelSwitch);
	}
}
