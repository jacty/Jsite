import {connectToBrowser} from './Connector.js';
import {Launcher} from './Launcher.js';

export class Pup{
    constructor(settings){ 
    }
    connect(options){
       return connectToBrowser(options);
    }
    // Launches a pup and a browser instance.
    launch(options){
        // class ChromeLauncher
        this.launcher = new Launcher();
        return this.launcher.launch(options);

    }
}
