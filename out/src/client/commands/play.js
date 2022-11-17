"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
exports.default = (commandName) => ({
    name: commandName,
    description: 'Plays 7/24 classical music in your voice channel.',
    options: [{
            name: 'channel',
            type: eris_1.Constants.ApplicationCommandOptionTypes.STRING,
            description: 'Channel or Channel ID for playing classical music.',
            required: false,
        }],
    type: 1,
});
