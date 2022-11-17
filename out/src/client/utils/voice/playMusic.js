"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
const logCatch_1 = __importDefault(require("../misc/logCatch"));
// Needs revision and fix.
exports.default = (connection) => {
    (0, youtube_dl_exec_1.default)('https://www.youtube.com/watch?v=sGHgBP9-zXo', {
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
        console.log(response);
        if (connection.playing) {
            await connection.stopPlaying();
        }
        if (response.formats[0]) {
            await connection.play(response.formats[0].url);
        }
        else {
            console.log('there is a problem with getting formats.');
        }
    }).catch(logCatch_1.default);
};
