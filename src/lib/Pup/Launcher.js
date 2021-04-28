import {BrowserRunner} from './BrowserRunner.js';
import {Browser} from './Browser.js';
// class ChromeLauncher
export class Launcher{
    constructor(){}
    async launch(options){
        const {timeout = 30000} = options;
        const runner = new BrowserRunner();
        runner.start();
        try{
            const connection = await runner.setupConnection({timeout});
            const browser = await Browser.create(
                connection,
                [],
                runner.proc,
                runner.close.bind(runner)
            );
            await browser.waitForTarget((t) => t.type() === 'page');
            return browser;
        } catch(error){
            runner.kill();
            throw error;
        }
    }
}