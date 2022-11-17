import axios from 'axios';
import type { CommandInteraction } from 'eris';
import { databaseURL } from '../../../../config';
import Client from '../../client';
import logCatch from '../../utils/misc/logCatch';

// Needs revision
export default async (interaction: CommandInteraction) => {
	const { client } = Client;
	if (interaction.member) {
		const guildID = interaction.member.guild.id;
		await axios.get(`${databaseURL}/channels.json`).then((response) => {
			if (response.data === null) {
				// Probably there is a error somewhere log this.
				return;
			}
			Object.keys(response.data).forEach(async (key) => {
				if (guildID === response.data[key].guildID) {
					const connection = client.voiceConnections.get(response.data[key].guildID);
					if (connection) {
						connection.stopPlaying();
						connection.disconnect();
					}
					await axios.delete(`${databaseURL}/channels/${key}.json`);
					await axios.get(`${databaseURL}/activeConnections.json`).then((rs) => {
						if (rs.data !== null) {
							Object.keys(rs.data).forEach(async (rsKey) => {
								if (rs.data[rsKey].channelID === response.data[key].channelID) {
									await axios.delete(`${databaseURL}/activeConnections/${rsKey}.json`);
								}
							});
						}
					}).catch(logCatch);
				}
			});
		}).catch(logCatch);
		await interaction.createMessage({
			content: '**Thanks for using classical bot.** ❤️',
			flags: 64,
		});
	}
};
