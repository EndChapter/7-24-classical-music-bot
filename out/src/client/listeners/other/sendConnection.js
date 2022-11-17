"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../client"));
const playVoice_1 = __importDefault(require("../../utils/voice/playVoice"));
exports.default = async (_member, channel) => {
    const { client } = client_1.default;
    const connection = await client.voiceConnections.find((connect) => connect.channelID === channel.id);
    if (connection) {
        (0, playVoice_1.default)(channel.voiceMembers.size, connection, channel.id, false);
    }
};
