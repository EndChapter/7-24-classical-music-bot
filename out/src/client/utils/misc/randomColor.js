"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return parseInt(color, 16);
};
