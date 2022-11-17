import axios from 'axios';
import { databaseURL } from '../../../../config';

export default (channelID: string) => {
	axios.post(`${databaseURL}/activeConnections.json`, {
		channelID,
		timestamp: Date.now(),
	});
};
