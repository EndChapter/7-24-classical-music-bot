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
	let channelID = '';
	let value = '';
	await interaction.createMessage(getEmbed('Play', '**Processing...**', client.user.staticAvatarURL));
	if (interaction.data) {
		if (interaction.data.options) {
			if (interaction.data.options[0]) {
				value = (interaction.data.options[0] as InteractionDataOptionsWithValue).value as string;
			}
		}
	}
	if (value !== '') {
		channelID = channelRegex(value);
		if (channelID === '') {
			await interaction.editOriginalMessage(getEmbed(
				'Play',
				'・ **I need a valid voice channel or valid voice channel id for this command.** 🤗',
				client.user.staticAvatarURL,
			));
			return;
		}
	}
	if (interaction.member) {
		guildID = interaction.member.guild.id;
		if (value === '') {
			if (interaction.member.voiceState !== undefined) {
				if (interaction.member.voiceState.channelID !== null) {
					channelID = interaction.member.voiceState.channelID;
				}
				else {
					await interaction.editOriginalMessage(getEmbed(
						'Play',
						'・ **You need to specify a voice channel or you need to be in the voice channel.** 😵‍💫',
						client.user.staticAvatarURL,
					));
					return;
				}
			}
			else {
				await interaction.editOriginalMessage(getEmbed(
					'Play',
					'・ **You need to specify a voice channel or you need to be in the voice channel.** 😵‍💫',
					client.user.staticAvatarURL,
				));
				return;
			}
		}
	}
	else {
		await interaction.editOriginalMessage(getEmbed('Play', '・ **Unfortunately, You can\'t use bot in dm or groups.** 🤗', client.user.staticAvatarURL));
		return;
	}

	const channel = client.getChannel(channelID);
	if (!(channel instanceof VoiceChannel)) {
		await interaction.editOriginalMessage(getEmbed('Play', '・ **I need a valid voice channel or valid voice channel id for this command.** 🧐', client.user.staticAvatarURL));
		return;
	}
	// Checking for if the guild cached before.
	let channelFound = false;
	const channels = await getActiveChannels();
	await channels.reduce(async (previousActiveChannel, activeChannel) => {
		await previousActiveChannel;
		if (activeChannel.guildID === guildID) {
			if (activeChannel.channelID === channelID) {
				await interaction.editOriginalMessage(getEmbed('Play', '・ **You\'re already using the bot in the same channel.**🤠', client.user.staticAvatarURL));
				channelFound = true;
				return;
			}
			await deleteActiveChannel(activeChannel.privateKey);
		}
	}, Promise.resolve());
	if (!channelFound) {
		await interaction.editOriginalMessage(getEmbed('Play', '・ **Thanks for using classical bot.** ❤️', client.user.staticAvatarURL)).catch(logCatch);
		await postActiveChannel(channelID, guildID);
		await client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
			const realVoiceMembersCount = (await client.getChannel(channelID) as VoiceChannel).voiceMembers.filter((i) => i.id !== client.user.id).length;
			await playVoice(realVoiceMembersCount, connection, channelID);
			await interaction.editOriginalMessage(getEmbed('Play', '・ **Thanks for using classical bot.** ❤️', client.user.staticAvatarURL)).catch(logCatch);
		}).catch(logCatch);
	}
};
