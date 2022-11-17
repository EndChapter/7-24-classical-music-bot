"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../../config");
const logCatch_1 = __importDefault(require("../misc/logCatch"));
exports.default = async () => {
    const activeConnections = [];
    await axios_1.default.get(`${config_1.databaseURL}/activeConnections.json`).then((response) => {
        if (response.data !== null) {
            Object.keys(response.data).forEach((key) => {
                activeConnections.push({
                    channelID: response.data[key].channelID,
                    timestamp: response.data[key].timestamp,
                    privateKey: key,
                });
            });
            return activeConnections;
        }
        return activeConnections;
    }).catch(logCatch_1.default);
    return activeConnections;
};
