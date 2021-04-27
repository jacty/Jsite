import * as childProcess from 'child_process';
import {helper} from './helper.js';
import * as readline from 'readline';
import { WebSocketTransport} from './WebSocketTransport.js'
import {Connection} from './Connection.js';

export class BrowserRunner{
    _closed = true;
    _listeners = [];
    constructor(
        executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        processArg = ['--headless',"--user-data-dir=temp",'--remote-debugging-port=9222'],
        ){
        this._executablePath = executablePath;
        this._processArg = processArg;
    }
    start(options){
        // start Chrome
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
    close(){
        if (this._closed) return Promise.resolve();
        if (this.connection){
            this.connection.send('Browser.close').catch((err)=>{
                this.kill();
            });
        }
        helper.removeEventListeners(this._listeners);
        return this._processClosing;
    }
    kill(){
        console.error('kill', this.proc);
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
    async setupConnection(options){
        const {timeout} = options;
        const browserWSEndpoint = await waitForWSEndpoint(
            this.proc,
            timeout,
        )
        const transport = await WebSocketTransport.create(browserWSEndpoint);
        this.connection = new Connection(browserWSEndpoint, transport)
        return this.connection;
    }
}

function waitForWSEndpoint(browserProcess, timeout){
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({input: browserProcess.stderr});
        let stderr = '';
        const listeners = [
            helper.addEventListener(rl, 'line', onLine),
            helper.addEventListener(rl, 'close', onClose),
            helper.addEventListener(browserProcess, 'exit', onClose),
            helper.addEventListener(browserProcess, 'error', (err) => onClose(err))
        ];
        const timeoutId = timeout ? setTimeout(onTimeout, timeout) : 0;

        function onClose(error){
            cleanup();
            reject(
                new Error(`Failed to launch the browser process! ${error ? error.message : ''} ${stderr}`)
            )
        }

        function onTimeout(){
            cleanup();
            reject(
                new Error(`Timed out after ${timeout} ms while trying to connect to the browser.`)
            )
        }

        function onLine(line){
            stderr += line +'\n';
            const match = line.match(/^DevTools listening on (ws:\/\/.*)$/);
            if(!match) return;
            cleanup();
            resolve(match[1]);
        }

        function cleanup(){
            if (timeoutId) clearTimeout(timeoutId);
            helper.removeEventListeners(listeners);
        }
    });
}