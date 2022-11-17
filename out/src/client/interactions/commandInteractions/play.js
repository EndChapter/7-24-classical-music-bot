"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const eris_1 = require("eris");
const config_1 = require("../../../../config");
const client_1 = __importDefault(require("../../client"));
const getActiveChannels_1 = __importDefault(require("../../utils/activeChannel/getActiveChannels"));
const logCatch_1 = __importDefault(require("../../utils/misc/logCatch"));
const randomColor_1 = __importDefault(require("../../utils/misc/randomColor"));
const playVoice_1 = __importDefault(require("../../utils/voice/playVoice"));
// Needs Revision
exports.default = async (interaction) => {
    const { client } = client_1.default;
    let guildID = '';
    let channelID;
    let value = '';
    if (interaction.data) {
        if (interaction.data.options) {
            if (interaction.data.options[0]) {
                value = interaction.data.options[0].value;
            }
        }
    }
    if (value !== '') {
        const channelRegex = /<#[0-9]{18,19}>/;
        const numberRegex = /[0-9]{18,19}/;
        if (channelRegex.test(value)) {
            const valueArr = value.split('');
            valueArr.pop();
            valueArr.shift();
            valueArr.shift();
            channelID = valueArr.join('');
        }
        else if (numberRegex.test(value)) {
            channelID = value;
        }
        else {
            // log and message
            return;
        }
    }
    else if (interaction.member) {
        if (interaction.member.voiceState !== undefined) {
            if (interaction.member.voiceState.channelID !== null) {
                channelID = interaction.member.voiceState.channelID;
                guildID = interaction.member.guild.id;
            }
            else {
                // log and message
                return;
            }
        }
        else {
            // log and message
            return;
        }
    }
    else {
        // log and message
        return;
    }
    const channel = client.getChannel(channelID);
    if (!(channel instanceof eris_1.VoiceChannel)) {
        // log and message
        return;
    }
    let channelFound = false;
    // Checking for if the guild cached before.
    const channels = await (0, getActiveChannels_1.default)();
    channels.forEach((activeChannel) => {
        if (activeChannel.guildID === guildID) {
            if (activeChannel.channelID === channelID) {
                interaction.createMessage({
                    embeds: [{
                            description: '・ **You\'re already using the bot in the same channel.**🤠',
                            color: (0, randomColor_1.default)(),
                            timestamp: (new Date()).toISOString(),
                            footer: {
                                text: '7/24 Classical Music Bot',
                                icon_url: client.user.staticAvatarURL,
                            },
                        }],
                    flags: 64,
                });
                channelFound = true;
                return;
            }
            axios_1.default.delete(`${config_1.databaseURL}/channels/${activeChannel.privateKey}.json`);
        }
    });
    if (!channelFound) {
        axios_1.default.post(`${config_1.databaseURL}/channels.json`, {
            channelID,
            guildID,
        });
        client.joinVoiceChannel(channelID, { selfDeaf: true }).then(async (connection) => {
            const memberCount = client.getChannel(channelID).voiceMembers.size;
            (0, playVoice_1.default)(memberCount, connection, channelID, true);
        }).catch(logCatch_1.default);
        interaction.createMessage({
            embeds: [{
                    description: '・ **Thanks for using classical bot.** ❤️',
                    color: (0, randomColor_1.default)(),
                    timestamp: (new Date()).toISOString(),
                    footer: {
                        text: '7/24 Classical Music Bot',
                        icon_url: client.user.staticAvatarURL,
                    },
                }],
            flags: 64,
        });
    }
};
