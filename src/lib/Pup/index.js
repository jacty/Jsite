// import {connectToBrowser} from './Connection.js';
import {Launcher} from './Launcher.js';
// class Puppeteer
export class Pup{
    constructor(settings){ 
    }
    connect(options){
       // return connectToBrowser(options);
    }
    // Launches a pup and a browser instance.
    launch(options={}){
        // class ChromeLauncher
        this.launcher = new Launcher();
        return this.launcher.launch(options);
    }
}
