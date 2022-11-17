"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const play_1 = __importDefault(require("../commands/play"));
const stop_1 = __importDefault(require("../commands/stop"));
exports.default = async () => {
    const { client } = client_1.default;
    const commandNames = ['play', 'classical', 'stop'];
    const commands = await client.getCommands();
    commandNames.forEach((commandName) => {
        let commandExist = false;
        commands.forEach((command) => {
            if (commandName === command.name) {
                commandExist = true;
            }
        });
        if (!commandExist) {
            if (commandName !== 'stop') {
                client.createCommand((0, play_1.default)(commandName));
            }
            else {
                client.createCommand(stop_1.default);
            }
        }
    });
};
