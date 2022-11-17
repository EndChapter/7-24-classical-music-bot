import registerCommands from '../../init/commands';
import initializeVoice from '../../init/voice';
import Client from '../../client';

export default async () => {
	const { client } = Client;
	await registerCommands();
	await initializeVoice();

	const Guilds = client.guilds.map((guildd) => guildd.name);
	console.log(`INFO: Connected \`[${Guilds.join(', ')}]\` guilds!`);
};

