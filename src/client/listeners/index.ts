import axios from 'axios';
import type { VoiceConnection as VoiceConnectionT } from 'eris';
import {
	AutocompleteInteraction, Client, Constants, CommandInteraction, ComponentInteraction, InteractionDataOptionWithValue, Member, PingInteraction, VoiceChannel, VoiceConnection,
} from 'eris';
import youtubeDlExec from 'youtube-dl-exec';
import { databaseURL } from '../../../config';
import type { listeners } from '../interfaces/listeners.if';

// !
// IMPORTANT: Add cache for reloading links
// !

export default class Listeners implements listeners {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	static playVoice(memberCount: number, connection: VoiceConnectionT) {
		if (memberCount > 1) {
			// Update here after finished
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
						voiceDataTimeout: -1,
					});
				}
			}).catch((_err) => {
				// Log
			});
		}
	}

	initialize() {
		this.client.once('ready', this.ready);
		this.client.on('interactionCreate', this.interactionCreate);
		this.client.on('voiceChannelJoin', this.voiceChannelJoin);
		this.client.on('voiceChannelLeave', this.voiceChannelLeave);
		this.client.on('voiceChannelSwitch', this.voiceChannelSwitch);
	}

	ready() {
		this.client.createCommand({
			name: 'play',
			description: 'Plays 7/24 classical music in your voice channel.',
			options: [{
				name: 'Channel or Channel ID',
				type: Constants.ApplicationCommandOptionTypes.STRING,
				description: 'Channel or Channel ID for playing classical music.',
				required: true,
			}],
			type: 1,
		});
		this.client.createCommand({
			name: 'classical',
			description: 'Plays 7/24 classical music in your voice channel.',
			options: [
				{
					name: 'Channel or Channel ID',
					type: Constants.ApplicationCommandOptionTypes.INTEGER,
					description: 'Channel or Channel ID for playing classical music.',
					required: true,
				},
			],
			type: 1,
		});
		axios.get(`${databaseURL}/channels.json`).then((response) => {
			if (response.data === null) {
				return;
			}
			Object.values(response.data).forEach((channelID) => {
				this.client.joinVoiceChannel((channelID as string), { selfDeaf: true }).then(async (connection) => {
					const memberCount = (await this.client.getChannel((channelID as string)) as VoiceChannel).voiceMembers.size;
					Listeners.playVoice(memberCount, connection);
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
			if (interaction.data) {
				if (interaction.data.options) {
					if (interaction.data.options[0]) {
						if (interaction.data.name === 'play' || interaction.data.name === 'classical') {
							const value = (interaction.data.options[0] as InteractionDataOptionWithValue).value as string;
							const channelRegex = /<#[0-9]{18,19}>/;
							const numberRegex = /[0-9]{18,19}/;
							let channelID: string;
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
								// Log wrong input
								return;
							}
							const channel = this.client.getChannel(channelID);
							if (!(channel instanceof VoiceChannel)) {
								return;
							}
							axios.post(`${databaseURL}/channels.json`, {
								[channel.guild.id]: channelID,
							});
							this.client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
								const memberCount = (await this.client.getChannel(channelID) as VoiceChannel).voiceMembers.size;
								Listeners.playVoice(memberCount, connection);
							}).catch((err) => console.error(err));
						}
						else {
							// log
						}
					}
				}
			}
		}
	}

	async voiceChannelJoin(_member: Member, channel: VoiceChannel) {
		if (channel.voiceMembers.size < 1) {
			return;
		}
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			Listeners.playVoice(channel.voiceMembers.size, connection);
		}
		else {
			// log
		}
	}

	async voiceChannelLeave(_member: Member, channel: VoiceChannel) {
		if (channel.voiceMembers.size > 1) {
			return;
		}
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (connection) {
			await connection.stopPlaying();
		}
		else {
			// log
		}
	}

	async voiceChannelSwitch(_member: Member, channel: VoiceChannel) {
		const connection = await this.client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
		if (!connection) {
			return;
		}
		if (channel.voiceMembers.size < 1) {
			await connection.stopPlaying();
			return;
		}
		Listeners.playVoice(channel.voiceMembers.size, connection);
	}
}
