import youtubeDl from 'youtube-dl-exec';
import logCatch from '../misc/logCatch';

export default async () => {
	let musicUrl = '';
	await youtubeDl('https://www.youtube.com/watch?v=sGHgBP9-zXo', {
		dumpSingleJson: true,
		noCheckCertificates: true,
		noWarnings: true,
		preferFreeFormats: true,
		audioFormat: 'mp3',
		addHeader: [
			'referer:youtube.com',
			'user-agent:googlebot',
		],
	}).then((response) => {
		if (response.formats[0]) {
			musicUrl = response.formats[0].url;
		}
	}).catch(logCatch);
	return musicUrl;
};
