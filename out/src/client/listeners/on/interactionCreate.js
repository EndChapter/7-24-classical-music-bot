"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const stop_1 = __importDefault(require("../../interactions/commandInteractions/stop"));
const play_1 = __importDefault(require("../../interactions/commandInteractions/play"));
exports.default = (interaction) => {
    if (interaction instanceof eris_1.CommandInteraction) {
        if (interaction.data.name === 'play' || interaction.data.name === 'classical') {
            (0, play_1.default)(interaction);
        }
        else if (interaction.data.name === 'stop') {
            (0, stop_1.default)(interaction);
        }
        else {
            console.log('INFO: Unknown command called: ', interaction.data.name);
        }
        return;
    }
    console.log('INFO: Unknown interaction called.', interaction);
};
