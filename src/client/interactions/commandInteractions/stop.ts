import type { CommandInteraction } from 'eris';
import Client from '../../client';
import deleteActiveChannel from '../../utils/activeChannel/deleteActiveChannel';
import getActiveChannels from '../../utils/activeChannel/getActiveChannels';
import deleteActiveConnection from '../../utils/activeConnection/deleteActiveConnection';
import getActiveConnections from '../../utils/activeConnection/getActiveConnections';
import getEmbed from '../../utils/misc/getEmbed';

export default async (interaction: CommandInteraction) => {
	const { client } = Client;
	await interaction.createMessage(getEmbed('Stop', '**Processing...**', client.user.staticAvatarURL));
	if (interaction.member) {
		let channelFound = false;
		const guildID = interaction.member.guild.id;
		const activeChannels = await getActiveChannels();
		await activeChannels.reduce(async (previousActiveChannel, activeChannel) => {
			await previousActiveChannel;
			if (guildID === activeChannel.guildID) {
				channelFound = true;
				interaction.editOriginalMessage(getEmbed('Stop', '**Thanks for using classical bot.** ❤️', client.user.staticAvatarURL));
				const connection = client.voiceConnections.get(guildID);
				if (connection) {
					connection.stopPlaying();
					connection.disconnect();
				}
				await deleteActiveChannel(activeChannel.privateKey);
				const activeConnections = await getActiveConnections();
				activeConnections.forEach((activeConnection) => {
					if (activeConnection.channelID === activeChannel.channelID) {
						deleteActiveConnection(activeConnection.privateKey);
					}
				});
			}
		}, Promise.resolve());
		if (channelFound === false) {
			interaction.editOriginalMessage(getEmbed('Stop', '**You need to use `/play` first if you want to stop me.** 🤠', client.user.staticAvatarURL));
		}
	}
	else {
		interaction.editOriginalMessage(getEmbed(
			'Stop',
			'**Error. Don\'t worry. I sent a error message about this. It will be fixed soon(Hopefully.)**',
			client.user.staticAvatarURL,
		));
	}
};
