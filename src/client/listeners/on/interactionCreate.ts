import {
	CommandInteraction, Interaction,
} from 'eris';
import stopInteraction from '../../interactions/commandInteractions/stop';
import playInteraction from '../../interactions/commandInteractions/play';

export default (interaction: Interaction) => {
	if (interaction instanceof CommandInteraction) {
		if (interaction.data.name === 'play' || interaction.data.name === 'classical') {
			playInteraction(interaction);
		}
		else if (interaction.data.name === 'stop') {
			stopInteraction(interaction);
		}
		else {
			console.log('INFO: Unknown command called: ', interaction.data.name);
		}
		return;
	}
	console.log('INFO: Unknown interaction called.', interaction);
};
