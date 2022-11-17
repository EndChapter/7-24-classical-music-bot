"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __importDefault(require("../../init/commands"));
const voice_1 = __importDefault(require("../../init/voice"));
const client_1 = __importDefault(require("../../client"));
exports.default = async () => {
    const { client } = client_1.default;
    (0, commands_1.default)();
    (0, voice_1.default)();
    const Guilds = client.guilds.map((guildd) => guildd.name);
    console.log(`INFO: Connected \`[${Guilds.join(', ')}]\` guilds!`);
};
