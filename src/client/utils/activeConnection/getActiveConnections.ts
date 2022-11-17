import axios from 'axios';
import { databaseURL } from '../../../../config';
import type { activeConnection } from '../../interfaces/activeConnection.if';
import logCatch from '../misc/logCatch';

export default async () => {
	const activeConnections: activeConnection = [];
	await axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
		if (response.data !== null) {
			Object.keys(response.data).forEach((key) => {
				activeConnections.push({
					channelID: response.data[key].channelID,
					timestamp: response.data[key].timestamp,
					privateKey: key,
				});
			});
			return activeConnections;
		}
		return activeConnections;
	}).catch(logCatch);
	return activeConnections;
};
