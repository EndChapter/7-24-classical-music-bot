import type { VoiceConnection } from 'eris';
import deleteActiveConnection from '../activeConnection/deleteActiveConnection';
import getActiveConnections from '../activeConnection/getActiveConnections';
import postActiveConnections from '../activeConnection/postActiveConnections';
import MusicUrl from './MusicUrl';

export default async (memberCount: number, connection: VoiceConnection, channelID: string) => {
	let activeVoiceChannel = false;
	let privateKey = '';
	const cachedChannels = await getActiveConnections();
	cachedChannels.forEach((activeConnection) => {
		if (activeConnection.channelID === channelID) {
			activeVoiceChannel = true;
			privateKey = activeConnection.privateKey;
		}
	});
	if (memberCount > 0) {
		if (activeVoiceChannel) {
			await deleteActiveConnection(privateKey);
		}
		await postActiveConnections(channelID);
		const { musicUrl } = MusicUrl;
		if (connection.playing) {
			await connection.stopPlaying();
		}
		if (musicUrl !== '') {
			await connection.play(musicUrl);
		}
		else {
			console.log('ERROR: Error while getting music url');
		}
	}
	else {
		await deleteActiveConnection(privateKey);
	}
};
