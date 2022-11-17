import axios from 'axios';
import { CommandInteraction, InteractionDataOptionsWithValue, VoiceChannel } from 'eris';
import { databaseURL } from '../../../../config';
import Client from '../../client';
import getActiveChannels from '../../utils/activeChannel/getActiveChannels';
import logCatch from '../../utils/misc/logCatch';
import randomColor from '../../utils/misc/randomColor';
import playVoice from '../../utils/voice/playVoice';

// Needs Revision
export default async (interaction: CommandInteraction) => {
	const { client } = Client;
	let guildID = '';
	let channelID: string;
	let value = '';
	if (interaction.data) {
		if (interaction.data.options) {
			if (interaction.data.options[0]) {
				value = (interaction.data.options[0] as InteractionDataOptionsWithValue).value as string;
			}
		}
	}
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
	const channels = await getActiveChannels();
	channels.forEach(async (activeChannel) => {
		if (activeChannel.guildID === guildID) {
			if (activeChannel.channelID === channelID) {
				await interaction.createMessage({
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
			await axios.delete(`${databaseURL}/channels/${activeChannel.privateKey}.json`);
		}
	});
	if (!channelFound) {
		await axios.post(`${databaseURL}/channels.json`, {
			channelID,
			guildID,
		});
		await client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
			const memberCount = (await client.getChannel(channelID) as VoiceChannel).voiceMembers.size;
			await playVoice(memberCount, connection, channelID, true);
		}).catch(logCatch);
		await interaction.createMessage({
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
};
