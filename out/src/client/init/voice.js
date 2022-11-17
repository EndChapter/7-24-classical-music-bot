"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const getActiveChannels_1 = __importDefault(require("../utils/activeChannel/getActiveChannels"));
const deleteActiveConnection_1 = __importDefault(require("../utils/activeConnection/deleteActiveConnection"));
const getActiveConnections_1 = __importDefault(require("../utils/activeConnection/getActiveConnections"));
const postActiveConnections_1 = __importDefault(require("../utils/activeConnection/postActiveConnections"));
const playVoice_1 = __importDefault(require("../utils/voice/playVoice"));
// Needs revision
exports.default = async () => {
    const { client } = client_1.default;
    // In every 45 minutes. Live link become expired. So I will avoid with that.
    // TODO: Change link 1 time apply every check.
    const threeMinutes = 180000;
    const thirstyMinutes = 1800000;
    setInterval(() => {
        client.voiceConnections.forEach(async (connection) => {
            const activeConnections = await (0, getActiveConnections_1.default)();
            activeConnections.forEach((activeConnection) => {
                if (Date.now() - thirstyMinutes > activeConnection.timestamp) {
                    const cachedChannel = client.getChannel(activeConnection.channelID);
                    (0, playVoice_1.default)(cachedChannel.voiceMembers.size, connection, activeConnection.channelID, false);
                    // For sending new timestamp :p
                    (0, deleteActiveConnection_1.default)(activeConnection.privateKey);
                    (0, postActiveConnections_1.default)(activeConnection.channelID);
                }
            });
        });
    }, threeMinutes);
    // This is for the cases that bot resets itself.(and it means all cache gone so I need get cache from somewhere.)(and yes it happens a lot.)
    const activeChannels = await (0, getActiveChannels_1.default)();
    activeChannels.forEach((activeChannel) => {
        // PlayVoice should handled in voicechanneljoin.
        client.joinVoiceChannel(activeChannel.channelID, { selfDeaf: true }).then(async (connection) => {
            const memberCount = (await client.getChannel(activeChannel.channelID)).voiceMembers.size;
            (0, playVoice_1.default)(memberCount, connection, activeChannel.channelID, true);
        });
    });
};
