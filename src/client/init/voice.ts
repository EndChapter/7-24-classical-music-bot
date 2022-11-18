import type { VoiceChannel, VoiceConnection } from 'eris';
import Client from '../client';
import getActiveChannels from '../utils/activeChannel/getActiveChannels';
import deleteActiveConnection from '../utils/activeConnection/deleteActiveConnection';
import getActiveConnections from '../utils/activeConnection/getActiveConnections';
import postActiveConnections from '../utils/activeConnection/postActiveConnections';
import playVoice from '../utils/voice/playVoice';

export default async () => {
	const { client } = Client;
	// In every 45 minutes. Live link become expired. So I will avoid with that.
	const threeMinutes = 180000;
	const thirstyMinutes = 1800000;
	setInterval(() => {
		client.voiceConnections.reduce(async (previousConnection, connection: VoiceConnection) => {
			await previousConnection;
			const activeConnections = await getActiveConnections();
			activeConnections.reduce(async (previousActiveConnection, activeConnection) => {
				await previousActiveConnection;
				if (Date.now() - thirstyMinutes > activeConnection.timestamp) {
					const cachedChannel = client.getChannel(activeConnection.channelID) as VoiceChannel;
					await playVoice(cachedChannel.voiceMembers.size, connection, activeConnection.channelID, false);
					// For sending new timestamp :p
					await deleteActiveConnection(activeConnection.privateKey);
					await postActiveConnections(activeConnection.channelID);
				}
			}, Promise.resolve());
		}, Promise.resolve());
	}, threeMinutes);

	// This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
	const activeChannels = await getActiveChannels();
	activeChannels.forEach((activeChannel) => {
		client.joinVoiceChannel(activeChannel.channelID, { selfDeaf: true }).then(async (connection) => {
			const memberCount = (await client.getChannel(activeChannel.channelID) as VoiceChannel).voiceMembers.size;
			playVoice(memberCount, connection, activeChannel.channelID, true);
		});
	});
};
