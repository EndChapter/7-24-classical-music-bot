import type { VoiceConnection } from 'eris';
import type { activeConnections } from '../../interfaces/activeConnections.if';
import deleteActiveConnection from '../activeConnection/deleteActiveConnection';
import getActiveConnections from '../activeConnection/getActiveConnections';
import postActiveConnections from '../activeConnection/postActiveConnections';
import playMusic from './playMusic';

export default (memberCount: number, connection: VoiceConnection, channelID: string) => {
	let activeVoiceChannel = false;
	let privateKey = '';
	const cachedChannels: activeConnections = getActiveConnections();
	cachedChannels.forEach((activeConnection) => {
		if (activeConnection.channelID === channelID) {
			activeVoiceChannel = true;
			privateKey = activeConnection.privateKey;
		}
	});
	if (memberCount > 1) {
		if (!activeVoiceChannel) {
			postActiveConnections(channelID);
			playMusic(connection);
		}
	}
	else if (!activeVoiceChannel) {
		deleteActiveConnection(privateKey);
	}
};
