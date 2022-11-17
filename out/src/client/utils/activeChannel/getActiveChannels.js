"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../../config");
const logCatch_1 = __importDefault(require("../misc/logCatch"));
exports.default = async () => {
    const channelArr = [];
    await axios_1.default.get(`${config_1.databaseURL}/channels.json`).then((response) => {
        if (response.data === null) {
            return;
        }
        Object.keys(response.data).forEach((key) => {
            channelArr.push({
                channelID: response.data[key].channelID,
                guildID: response.data[key].guildID,
                privateKey: key,
            });
        });
    }).catch(logCatch_1.default);
    return channelArr;
};
