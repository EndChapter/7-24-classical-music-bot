import axios from 'axios';
import { databaseURL } from '../../../../config';
import type { activeConnections as activeConnectionsT } from '../../interfaces/activeConnections.if';
import logCatch from '../misc/logCatch';

export default () => {
	axios.get(`${databaseURL}/activeConnections.json`).then((response) => {
		if (response.data !== null) {
			const activeConnections: activeConnectionsT = [];
			Object.keys(response.data).forEach((key) => {
				activeConnections.push({
					channelID: response.data[key].channelID,
					privateKey: key,
				});
			});
			return activeConnections;
		}
		return [] as activeConnectionsT;
	}).catch(logCatch);
	return [] as activeConnectionsT;
};
