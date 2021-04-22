import {BrowserRunner} from './BrowserRunner.js';

// class ChromeLauncher
export class Launcher{
    constructor(){

    }
    async launch(){
        const runner = new BrowserRunner();
        runner.start();
        return 1
    }
}