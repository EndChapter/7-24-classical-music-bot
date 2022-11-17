"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../../config");
exports.default = async (channelID) => {
    await axios_1.default.post(`${config_1.databaseURL}/activeConnections.json`, {
        channelID,
        timestamp: Date.now(),
    });
};
