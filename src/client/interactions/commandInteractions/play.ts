import { CommandInteraction, InteractionDataOptionsWithValue, VoiceChannel } from 'eris';
import Client from '../../client';
import deleteActiveChannel from '../../utils/activeChannel/deleteActiveChannel';
import getActiveChannels from '../../utils/activeChannel/getActiveChannels';
import postActiveChannel from '../../utils/activeChannel/postActiveChannel';
import channelRegex from '../../utils/misc/channelRegex';
import getEmbed from '../../utils/misc/getEmbed';
import logCatch from '../../utils/misc/logCatch';
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
		channelID = channelRegex(value);
		if (channelID = '') {
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
				await interaction.createMessage(getEmbed('Play', '・ **You\'re already using the bot in the same channel.**🤠', client.user.staticAvatarURL));
				channelFound = true;
				return;
			}
			await deleteActiveChannel(activeChannel.privateKey);
		}
	});
	if (!channelFound) {
		await postActiveChannel(channelID, guildID);
		await client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
			const memberCount = (await client.getChannel(channelID) as VoiceChannel).voiceMembers.size;
			await playVoice(memberCount, connection, channelID, true);
		}).catch(logCatch);
		await interaction.createMessage(getEmbed('Play', '・ **Thanks for using classical bot.** ❤️', client.user.staticAvatarURL));
	}
};
