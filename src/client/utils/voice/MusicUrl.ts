import getMusicUrl from './getMusicUrl';

export default class MusicUrl {
	private static _musicUrl: string;

	static async init() {
		const fifteen = 900000;
		this._musicUrl = await getMusicUrl();
		setInterval(async () => {
			this._musicUrl = await getMusicUrl();
		}, fifteen);
	}

	static get musicUrl() {
		return this._musicUrl;
	}
}
