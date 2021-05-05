// import {connectToBrowser} from './Connection.js';
import {Launcher} from './Launcher.js';
// class Puppeteer
export class Pup{
    constructor(settings){}
    // Launches a pup and a browser instance.
    launch(){
        // class ChromeLauncher
        this.launcher = new Launcher();
        return this.launcher.launch();
    }
}
