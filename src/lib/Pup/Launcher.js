import {BrowserRunner} from './BrowserRunner.js';

// class ChromeLauncher
export class Launcher{
    constructor(){

    }
    async launch(options){
        const runner = new BrowserRunner(options);
        runner.start();
        console.error('Browser Launched')
        return 1
    }
}