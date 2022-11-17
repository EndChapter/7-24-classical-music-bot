import axios from 'axios';
import { databaseURL } from '../../../../config';
import type { activeChannel } from '../../interfaces/activeChannel.if';
import logCatch from '../misc/logCatch';

export default async () => {
	const channelArr: activeChannel = [];
	await axios.get(`${databaseURL}/channels.json`).then((response) => {
		if (response.data === null) {
			return;
		}
		Object.keys(response.data).forEach((key) => {
			channelArr.push({
				channelID: response.data[key].channelID,
				guildID: response.data[key].guildID,
				privateKey: key,
			});
		});
	}).catch(logCatch);
	return channelArr;
};
