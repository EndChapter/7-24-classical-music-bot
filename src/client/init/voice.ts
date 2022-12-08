import type { VoiceChannel, VoiceConnection } from 'eris';
import axios from 'axios';
import { databaseURL } from '../../../config';
import Client from '../client';
import getActiveChannels from '../utils/activeChannel/getActiveChannels';
import deleteActiveConnection from '../utils/activeConnection/deleteActiveConnection';
import deleteAllActiveConnections from '../utils/activeConnection/deleteAllActiveConnections';
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
					const realVoiceMembersCount = (await client.getChannel(activeConnection.channelID) as VoiceChannel).voiceMembers.filter((i) => i.id !== client.user.id).length;
					await playVoice(realVoiceMembersCount, connection, activeConnection.channelID);
					// For sending new timestamp :p
					await deleteActiveConnection(activeConnection.privateKey);
					await postActiveConnections(activeConnection.channelID);
				}
			}, Promise.resolve());
		}, Promise.resolve());
	}, threeMinutes);

	// This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
	const activeChannels = await getActiveChannels();
	// Deleting all active connections for clean database. playVoice handles and posts all active connections again.
	await deleteAllActiveConnections();
	await activeChannels.forEach(async (activeChannel) => {
		const channel = await client.getChannel(activeChannel.channelID);
		if (channel) {
			if (channel.type === 2) {
				channel.join({ selfDeaf: true }).then(async (connection: VoiceConnection) => {
					const realVoiceMembersCount = (await client.getChannel(activeChannel.channelID) as VoiceChannel).voiceMembers.filter((i) => i.id !== client.user.id).length;
					playVoice(realVoiceMembersCount, connection, activeChannel.channelID);
				});
			}
			else {
				axios.delete(`${databaseURL}/channels/${activeChannel.privateKey}`);
			}
		}
		else {
			axios.delete(`${databaseURL}/channels/${activeChannel.privateKey}`);
		}
	});
};
