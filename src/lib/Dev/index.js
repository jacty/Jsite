"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_parser_1 = __importDefault(require("yargs-parser"));
const cliFlags = yargs_parser_1.default(['x'], {
    array: ['install', 'env'],
});
const cliConfig = expandCliFlags(cliFlags);
function expandCliFlags(flags) {
    const { help, ...relevantFlags } = flags;
    for (const [flag, val] of Object.entries(relevantFlags)) {
        console.log(help, flag, val);
    }
}
