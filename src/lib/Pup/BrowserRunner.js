import * as childProcess from 'child_process';
import {helper} from './helper.js';

export class BrowserRunner{
    constructor(
        executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        processArg = ['--headless']
        ){
        this._executablePath = executablePath;
        this._processArg = processArg;
    }
    start(){
        this.proc = childProcess.spawn(
            this._executablePath,
            this._processArg,
            {   
                detached:true
            }
        );
        this._closed = false;
        this._processClosing = new Promise((fulfill) =>{
            this.proc.once('exit', ()=>{
                this._closed = true;
                fulfill();
            })
        });
        this._listeners = [
            helper.addEventListener(process, 'exit', this.kill.bind(this)),
        ]
    }
    kill(){
        if(this.proc && this.proc.pid && !this.proc.killed){
            try{
                this.proc.kill('SIGKILL');
            } catch (err){
                throw new Error(
                    `Failed to kill the process and may not able to launch again next time.\n Error cause: ${err.stack}`
                )
            }
        }
        helper.removeEventListeners(this._listeners);
    }
}