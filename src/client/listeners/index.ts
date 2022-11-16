import axios from 'axios';
import type { ApplicationCommand, ApplicationCommandStructure, VoiceConnection as VoiceConnectionT } from 'eris';
import {
	AutocompleteInteraction, Client, Constants, CommandInteraction, ComponentInteraction, InteractionDataOptionWithValue, Member, PingInteraction, VoiceChannel, VoiceConnection,
} from 'eris';
import youtubeDlExec from 'youtube-dl-exec';
import { databaseURL } from '../../../config';
import type { listeners } from '../interfaces/listeners.if';

// !
// IMPORTANT: Add cache for reloading links
// !
// TODO fix channels cache.
export default class Listeners implements listeners {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

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
					if (response.formats[0]) {
						await connection.play(response.formats[0].url, {
						// -1 Means no timeout
							voiceDataTimeout: -1,
						});
					}
				}).catch((_err) => {
				// Log
				});
			}
		}
		else if (activeVoiceChannel) {
			axios.delete(`${databaseURL}/activeConnections/${privateKey}.json`);
		}
	}

	initialize() {
		this.client.once('ready', this.ready);
		this.client.on('interactionCreate', this.interactionCreate);
		this.client.on('voiceChannelJoin', this.voiceChannelJoin);
		this.client.on('voiceChannelLeave', this.voiceChannelLeave);
		this.client.on('voiceChannelSwitch', this.voiceChannelSwitch);
		this.initializeVoice();
	}

	initializeVoice() {
		const threeMinutes = 180000;
		const thirstyMinutes = 1800000;
		// In every 45 minutes. Live link become expired. So I will avoid with that.
		// TODO: Change link 1 time apply every check.
		setInterval(() => {
			this.client.voiceConnections.forEach((connection: VoiceConnection) => {
				axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
					if (response.data !== null) {
						Object.keys(response.data).forEach((key) => {
							if (Date.now() - thirstyMinutes > response.data[key].timestamp) {
								const cachedChannel = this.client.getChannel(response.data[key].channelID) as VoiceChannel;
								Listeners.playVoice(cachedChannel.voiceMembers.size, connection, response.data[key].channelID);
							}
						});
					}
				}).catch((_err) => {
					// log
				});
			});
		}, threeMinutes);
	}

	async ready() {
		// P means Play
		const commandNames = ['play', 'classical', 'stop'];
		const commandPlay : (commandName: string) => ApplicationCommandStructure = (commandName: string) => ({
			name: commandName,
			description: 'Plays 7/24 classical music in your voice channel.',
			options: [{
				name: 'Channel or Channel ID',
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
		const commands = await this.client.getCommands();
		commandNames.forEach((commandName: string) => {
			let commandExist = false;
			commands.forEach((command: ApplicationCommand) => {
				if (commandName === command.name) {
					commandExist = true;
				}
			});
			if (!commandExist) {
				if (commandName === 'stop') {
					this.client.createCommand(commandPlay(commandName));
				}
				else {
					this.client.createCommand(commandStop);
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
				this.client.joinVoiceChannel((channelID as string), { selfDeaf: true }).then(async (connection) => {
					const memberCount = (await this.client.getChannel((channelID as string)) as VoiceChannel).voiceMembers.size;
					Listeners.playVoice(memberCount, connection, channelID);
				}).catch((err) => console.error(err));
			});
		}).catch((_err) => {
			// log
		});
		const Guilds = this.client.guilds.map((guildd) => guildd.name);
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
				let guildID: string;
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

				const channel = this.client.getChannel(channelID);
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
						const cachedChannel = this.client.getChannel(response.data[key].channelID) as VoiceChannel;
						if (cachedChannel.guild.id === channel.guild.id) {
							axios.delete(`${databaseURL}/channels/${key}.json`);
						}
					});
				}).catch((_err) => {
					// log
				});
				axios.post(`${databaseURL}/channels.json`, {
					channelID,
					// guildID,
				});
				this.client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
					const memberCount = (await this.client.getChannel(channelID) as VoiceChannel).voiceMembers.size;
					Listeners.playVoice(memberCount, connection, channelID);
				}).catch((err) => console.error(err));
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
								const connection = this.client.voiceConnections.get(response.data[key].guildID);
								if (connection) {
									connection.stopPlaying();
									connection.disconnect();
								}
								axios.delete(`${databaseURL}/channels/${key}.json`);
							}
						});
					}).catch((_err) => {
						// log
					});
				}
			}
			else {
				// log
			}
		}
	}

	async voiceChannelJoin(_member: Member, channel: VoiceChannel) {
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Listeners.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}

	async voiceChannelLeave(_member: Member, channel: VoiceChannel) {
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Listeners.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}

	async voiceChannelSwitch(_member: Member, channel: VoiceChannel) {
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Listeners.playVoice(channel.voiceMembers.size, connection, channel.id);
		}
	}
}
