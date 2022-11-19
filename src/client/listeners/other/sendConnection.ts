import type { Member, VoiceChannel, VoiceConnection } from 'eris';
import Client from '../../client';
import playVoice from '../../utils/voice/playVoice';

export default async (_member: Member, channel: VoiceChannel) => {
	const { client } = Client;
	const connection = await client.voiceConnections.find((connect: VoiceConnection) => connect.channelID === channel.id);
	if (connection) {
		const realVoiceMembersCount = channel.voiceMembers.filter((i) => i.id !== client.user.id).length;
		await playVoice(realVoiceMembersCount, connection, channel.id);
	}
};

