import type { VoiceConnection } from 'eris';
import youtubeDl from 'youtube-dl-exec';
import logCatch from '../misc/logCatch';

// Needs revision and fix.
export default (connection: VoiceConnection) => {
	youtubeDl('https://www.youtube.com/watch?v=sGHgBP9-zXo', {
		dumpSingleJson: true,
		noCheckCertificates: true,
		noWarnings: true,
		preferFreeFormats: true,
		audioFormat: 'mp3',
		addHeader: [
			'referer:youtube.com',
			'user-agent:googlebot',
		],
	}).then(async (response) => {
		if (connection.playing) {
			await connection.stopPlaying();
		}
		if (response.formats[2]) {
			await connection.play(response.formats[2].url, {
			// -1 Means no timeout
				voiceDataTimeout: -1,
			});
		}
		else {
			console.log('there is a problem with getting formats.');
		}
	}).catch(logCatch);
};
