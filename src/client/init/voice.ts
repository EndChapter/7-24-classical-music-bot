import axios from 'axios';
import type { VoiceChannel, VoiceConnection } from 'eris';
import { databaseURL } from '../../../config';
import Client from '../client';
import logCatch from '../utils/misc/logCatch';
import playVoice from '../utils/voice/playVoice';

// Needs revision
export default () => {
	const { client } = Client;
	// In every 45 minutes. Live link become expired. So I will avoid with that.
	// TODO: Change link 1 time apply every check.
	const threeMinutes = 180000;
	const thirstyMinutes = 1800000;
	setInterval(() => {
		client.voiceConnections.forEach((connection: VoiceConnection) => {
			axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
				if (response.data !== null) {
					Object.keys(response.data).forEach((key) => {
						if (Date.now() - thirstyMinutes > response.data[key].timestamp) {
							const cachedChannel = client.getChannel(response.data[key].channelID) as VoiceChannel;
							playVoice(cachedChannel.voiceMembers.size, connection, response.data[key].channelID);
						}
					});
				}
			}).catch(logCatch);
		});
	}, threeMinutes);

	// This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
	axios.get(`${databaseURL}/channels.json`).then((response) => {
		if (response.data === null) {
			return;
		}
		Object.keys(response.data).forEach((key) => {
			const { channelID } = response.data[key];
			client.joinVoiceChannel((channelID as string), { selfDeaf: true }).then(async (connection) => {
				const memberCount = (await client.getChannel((channelID as string)) as VoiceChannel).voiceMembers.size;
				playVoice(memberCount, connection, channelID);
			}).catch((err) => console.error(err));
		});
	}).catch(logCatch);
};
