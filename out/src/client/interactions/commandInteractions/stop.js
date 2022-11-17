"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../../config");
const client_1 = __importDefault(require("../../client"));
const logCatch_1 = __importDefault(require("../../utils/misc/logCatch"));
// Needs revision
exports.default = (interaction) => {
    const { client } = client_1.default;
    if (interaction.member) {
        const guildID = interaction.member.guild.id;
        axios_1.default.get(`${config_1.databaseURL}/channels.json`).then((response) => {
            if (response.data === null) {
                // Probably there is a error somewhere log this.
                return;
            }
            Object.keys(response.data).forEach((key) => {
                if (guildID === response.data[key].guildID) {
                    const connection = client.voiceConnections.get(response.data[key].guildID);
                    if (connection) {
                        connection.stopPlaying();
                        connection.disconnect();
                    }
                    axios_1.default.delete(`${config_1.databaseURL}/channels/${key}.json`);
                    axios_1.default.get(`${config_1.databaseURL}/activeConnections.json`).then((rs) => {
                        if (rs.data !== null) {
                            Object.keys(rs.data).forEach((rsKey) => {
                                if (rs.data[rsKey].channelID === response.data[key].channelID) {
                                    axios_1.default.delete(`${config_1.databaseURL}/activeConnections/${rsKey}.json`);
                                }
                            });
                        }
                    }).catch(logCatch_1.default);
                }
            });
        }).catch(logCatch_1.default);
        interaction.createMessage({
            content: '**Thanks for using classical bot.** ❤️',
            flags: 64,
        });
    }
};
