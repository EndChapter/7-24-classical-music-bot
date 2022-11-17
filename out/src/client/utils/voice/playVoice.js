"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteActiveConnection_1 = __importDefault(require("../activeConnection/deleteActiveConnection"));
const getActiveConnections_1 = __importDefault(require("../activeConnection/getActiveConnections"));
const postActiveConnections_1 = __importDefault(require("../activeConnection/postActiveConnections"));
const getMusicUrl_1 = __importDefault(require("./getMusicUrl"));
exports.default = async (memberCount, connection, channelID, justJoined) => {
    let activeVoiceChannel = false;
    let privateKey = '';
    const cachedChannels = await (0, getActiveConnections_1.default)();
    cachedChannels.forEach((activeConnection) => {
        if (activeConnection.channelID === channelID) {
            activeVoiceChannel = true;
            privateKey = activeConnection.privateKey;
        }
    });
    if (memberCount > 1 || (justJoined && memberCount === 1)) {
        if (activeVoiceChannel) {
            (0, deleteActiveConnection_1.default)(privateKey);
        }
        (0, postActiveConnections_1.default)(channelID);
        const musicUrl = await (0, getMusicUrl_1.default)();
        if (connection.playing) {
            await connection.stopPlaying();
        }
        if (musicUrl !== '') {
            await connection.play(musicUrl);
        }
        else {
            console.log('ERROR: Error while getting music url');
        }
    }
    else {
        (0, deleteActiveConnection_1.default)(privateKey);
    }
};
