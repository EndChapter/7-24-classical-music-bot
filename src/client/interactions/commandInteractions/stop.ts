import axios from 'axios';
import type { CommandInteraction } from 'eris';
import { databaseURL } from '../../../../config';
import Client from '../../client';
import logCatch from '../../utils/misc/logCatch';

// Needs revision
export default (interaction: CommandInteraction) => {
	const { client } = Client;
	if (interaction.member) {
		const guildID = interaction.member.guild.id;
		axios.get(`${databaseURL}/channels.json`).then((response) => {
			if (response.data === null) {
				// Probably there is a error somewhere log this.
				return;
			}
			Object.keys(response.data).forEach((key) => {
				if (guildID === response.data[key].guildID) {
					const connection = client.voiceConnections.get(response.data[key].guildID);
					if (connection) {
						connection.stopPlaying();
						connection.disconnect();
					}
					axios.delete(`${databaseURL}/channels/${key}.json`);
					axios.get(`${databaseURL}/activeConnections.json`).then((rs) => {
						if (rs.data !== null) {
							Object.keys(rs.data).forEach((rsKey) => {
								if (rs.data[rsKey].channelID === response.data[key].channelID) {
									axios.delete(`${databaseURL}/activeConnections/${rsKey}.json`);
								}
							});
						}
					}).catch(logCatch);
				}
			});
		}).catch(logCatch);
		interaction.createMessage({
			content: '**Thanks for using classical bot.** ❤️',
			flags: 64,
		});
	}
};
