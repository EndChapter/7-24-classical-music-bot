import type {
	AutocompleteInteraction, Member, CommandInteraction, ComponentInteraction, PingInteraction, Client, VoiceChannel,
} from 'eris';

export type listeners = {
	client: Client;
	initialize: () => void;
	ready: () => void;
	interactionCreate: (interaction: PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction) => void;
	voiceChannelJoin: (_member: Member, channel: VoiceChannel) => void;
	voiceChannelLeave: (_member: Member, channel: VoiceChannel) => void;
	voiceChannelSwitch: (_member: Member, channel: VoiceChannel) => void;
}
