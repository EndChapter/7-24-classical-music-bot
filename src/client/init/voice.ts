import type { VoiceChannel, VoiceConnection } from 'eris';
import Client from '../client';
import getActiveChannels from '../utils/activeChannel/getActiveChannels';
import deleteActiveConnection from '../utils/activeConnection/deleteActiveConnection';
import getActiveConnections from '../utils/activeConnection/getActiveConnections';
import postActiveConnections from '../utils/activeConnection/postActiveConnections';
import playVoice from '../utils/voice/playVoice';

// Needs revision
export default async () => {
	const { client } = Client;
	// In every 45 minutes. Live link become expired. So I will avoid with that.
	// TODO: Change link 1 time apply every check.
	const threeMinutes = 180000;
	const thirstyMinutes = 1800000;
	setInterval(() => {
		client.voiceConnections.forEach(async (connection: VoiceConnection) => {
			const activeConnections = await getActiveConnections();
			activeConnections.forEach((activeConnection) => {
				if (Date.now() - thirstyMinutes > activeConnection.timestamp) {
					const cachedChannel = client.getChannel(activeConnection.channelID) as VoiceChannel;
					playVoice(cachedChannel.voiceMembers.size, connection, activeConnection.channelID, false);
					// For sending new timestamp :p
					deleteActiveConnection(activeConnection.privateKey);
					postActiveConnections(activeConnection.channelID);
				}
			});
		});
	}, threeMinutes);

	// This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
	const activeChannels = await getActiveChannels();
	activeChannels.forEach((activeChannel) => {
		// PlayVoice should handled in voicechanneljoin.
		client.joinVoiceChannel(activeChannel.channelID, { selfDeaf: true }).then(async (connection) => {
			const memberCount = (await client.getChannel(activeChannel.channelID) as VoiceChannel).voiceMembers.size;
			playVoice(memberCount, connection, activeChannel.channelID, true);
		});
	});
};