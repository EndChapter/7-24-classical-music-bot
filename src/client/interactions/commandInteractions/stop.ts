import type { CommandInteraction } from 'eris';
import Client from '../../client';
import deleteActiveChannel from '../../utils/activeChannel/deleteActiveChannel';
import getActiveChannels from '../../utils/activeChannel/getActiveChannels';
import deleteActiveConnection from '../../utils/activeConnection/deleteActiveConnection';
import getActiveConnections from '../../utils/activeConnection/getActiveConnections';
import getEmbed from '../../utils/misc/getEmbed';

export default async (interaction: CommandInteraction) => {
	const { client } = Client;
	if (interaction.member) {
		const guildID = interaction.member.guild.id;
		const activeChannels = await getActiveChannels();
		await activeChannels.reduce(async (previousActiveChannel, activeChannel) => {
			await previousActiveChannel;
			if (guildID === activeChannel.guildID) {
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
		await interaction.createMessage(getEmbed('Stop', '**Thanks for using classical bot.** ❤️', client.user.staticAvatarURL));
	}
};
