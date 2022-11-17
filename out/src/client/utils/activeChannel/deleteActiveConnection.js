"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../../../config");
const logCatch_1 = __importDefault(require("../misc/logCatch"));
exports.default = async (privateKey) => {
    await axios_1.default.delete(`${config_1.databaseURL}/channels/${privateKey}.json`).catch(logCatch_1.default);
};
