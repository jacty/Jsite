import {Events} from './Events.js';

class Connection extends Events{
    _lastId = 0;
    constructor(url, transport){
        super();
        this._transport = transport;
    }
    send(method, ...args){
        const params = args.length ? args[0] : undefined;
        const id = this._rawSend({method, params});
    }
    _rawSend(msg){
        const id = ++this._lastId;
        const stringifiedMsg = JSON.stringify(
            Object.assign({}, msg, {id})
        );;
        console.error('_rawSend', this._transport.send)
    }
}

export async function connectToBrowser(options){
    const connection = new Connection();
    const id = await connection.send('Target.getBrowserContexts');
}

