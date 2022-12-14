import { ApplicationCommandStructure, Constants } from 'eris';

export default (commandName: string): ApplicationCommandStructure => ({
	name: commandName,
	description: 'Plays 7/24 classical music in your voice channel.',
	options: [{
		name: 'channel',
		type: Constants.ApplicationCommandOptionTypes.STRING,
		description: 'Channel or Channel ID for playing classical music.',
		required: false,
	}],
	type: 1,
});
