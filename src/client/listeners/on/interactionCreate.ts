import axios from 'axios';
import {
	CommandInteraction, Interaction, InteractionDataOptionsWithValue, VoiceChannel,
} from 'eris';
import { databaseURL } from '../../../../config';
import Client from '../../client';
import logCatch from '../../utils/misc/logCatch';
import randomColor from '../../utils/misc/randomColor';
import playVoice from '../../utils/voice/playVoice';

// Needs revision
export default 	(interaction: Interaction) => {
	const { client } = Client;
	if (interaction instanceof CommandInteraction) {
		let value = '';
		if (interaction.data) {
			if (interaction.data.options) {
				if (interaction.data.options[0]) {
					value = (interaction.data.options[0] as InteractionDataOptionsWithValue).value as string;
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

			const channel = client.getChannel(channelID);
			if (!(channel instanceof VoiceChannel)) {
				// log and message
				return;
			}
			let channelFound = false;
			// Checking for if the guild cached before.
			axios.get(`${databaseURL}/channels.json`).then((response) => {
				if (response.data === null) {
					return;
				}
				Object.keys(response.data).forEach((key) => {
					const cachedChannel = client.getChannel(response.data[key].channelID) as VoiceChannel;
					if (cachedChannel.guild.id === channel.guild.id) {
						if (cachedChannel.id === channelID) {
							interaction.createMessage({
								embeds: [{
									description: '・ **You\'re already using the bot in the same channel.**🤠',
									color: randomColor(),
									timestamp: (new Date()).toISOString(),
									footer: {
										text: '7/24 Classical Music Bot',
										icon_url: client.user.staticAvatarURL,
									},
								}],
								flags: 64,
							});
							channelFound = true;
							return;
						}
						axios.delete(`${databaseURL}/channels/${key}.json`);
					}
				});
			}).catch(logCatch);
			if (channelFound) {
				axios.post(`${databaseURL}/channels.json`, {
					channelID,
					guildID,
				});
				client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
					const memberCount = (client.getChannel(channelID) as VoiceChannel).voiceMembers.size;
					playVoice(memberCount, connection, channelID);
				}).catch(logCatch);
				interaction.createMessage({
					embeds: [{
						description: '・ **Thanks for using classical bot.** ❤️',
						color: randomColor(),
						timestamp: (new Date()).toISOString(),
						footer: {
							text: '7/24 Classical Music Bot',
							icon_url: client.user.staticAvatarURL,
						},
					}],
					flags: 64,
				});
			}
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
							const connection = client.voiceConnections.get(response.data[key].guildID);
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
							}).catch(logCatch);
						}
					});
				}).catch(logCatch);
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
};
