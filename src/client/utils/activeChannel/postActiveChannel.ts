import axios from 'axios';
import { databaseURL } from '../../../../config';

export default async (channelID: string, guildID: string) => {
	await axios.post(`${databaseURL}/channels.json`, {
		channelID,
		guildID,
	});
};
