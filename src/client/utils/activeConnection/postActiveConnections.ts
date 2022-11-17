import axios from 'axios';
import { databaseURL } from '../../../../config';

export default async (channelID: string) => {
	await axios.post(`${databaseURL}/activeConnections.json`, {
		channelID,
		timestamp: Date.now(),
	});
};
