import * as childProcess from 'child_process';

export class BrowserRunner{
    constructor(){

    }
    start(){
        this.proc = childProcess.spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    }
}