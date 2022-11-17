import type { ApplicationCommand } from 'eris';
import Client from '../client';
import play from '../commands/play';
import stop from '../commands/stop';

export default async () => {
	const { client } = Client;
	const commandNames = ['play', 'classical', 'stop'];
	const commands = await client.getCommands();
	commandNames.forEach(async (commandName: string) => {
		let commandExist = false;
		commands.forEach((command: ApplicationCommand) => {
			if (commandName === command.name) {
				commandExist = true;
			}
		});
		if (!commandExist) {
			if (commandName !== 'stop') {
				await client.createCommand(play(commandName));
			}
			else {
				await client.createCommand(stop);
			}
		}
	});
};
