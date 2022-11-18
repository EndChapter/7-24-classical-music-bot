import getMusicUrl from './getMusicUrl';

export default class MusicUrl {
	private static _musicUrl: string;

	static async init() {
		const thirstyMinutes = 1800000;
		this._musicUrl = await getMusicUrl();
		setInterval(async () => {
			this._musicUrl = await getMusicUrl();
		}, thirstyMinutes);
	}

	static get musicUrl() {
		return this._musicUrl;
	}
}
