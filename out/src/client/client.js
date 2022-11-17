"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const config_1 = require("../../config");
const interactionCreate_1 = __importDefault(require("./listeners/on/interactionCreate"));
const ready_1 = __importDefault(require("./listeners/once/ready"));
const sendConnection_1 = __importDefault(require("./listeners/other/sendConnection"));
class Client {
    // Inspired from https://github.com/Member-Counter/bot Yo respect to your code man this is so perfect. Also I cant steal all code I can just inspire from your client use.
    static init() {
        Client._client = new eris_1.Client(config_1.bottok, {
            allowedMentions: {
                everyone: false,
            },
            intents: ['allNonPrivileged', 'guildMembers'],
            largeThreshold: 0,
            maxResumeAttempts: 1000,
            disableEvents: {
                CHANNEL_CREATE: true,
                CHANNEL_DELETE: true,
                CHANNEL_UPDATE: true,
                GUILD_BAN_ADD: true,
                GUILD_BAN_REMOVE: true,
                GUILD_MEMBER_ADD: true,
                GUILD_MEMBER_REMOVE: true,
                GUILD_MEMBER_UPDATE: true,
                GUILD_ROLE_CREATE: true,
                GUILD_ROLE_DELETE: true,
                GUILD_ROLE_UPDATE: true,
                GUILD_UPDATE: true,
                MESSAGE_DELETE: true,
                MESSAGE_DELETE_BULK: true,
                MESSAGE_UPDATE: true,
                PRESENCE_UPDATE: true,
                TYPING_START: true,
                USER_UPDATE: true,
            },
            seedVoiceConnections: true,
        });
        Client._client.once('ready', ready_1.default);
        Client.client.on('interactionCreate', interactionCreate_1.default);
        Client.client.on('voiceChannelJoin', sendConnection_1.default);
        Client.client.on('voiceChannelLeave', sendConnection_1.default);
        Client.client.on('voiceChannelSwitch', sendConnection_1.default);
        Client.client.connect();
    }
    static get client() {
        return this._client;
    }
}
exports.default = Client;
