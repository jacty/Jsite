import NodeWebSocket from 'ws';
//NodeWebSocketTransport
export class WebSocketTransport{
    static create(url){
        return new Promise((resolve, reject) =>{
            const ws = new NodeWebSocket(url, [], {
                perMessageDeflate: false,
                maxPayload: 256 * 1024 * 1024,
            });
            ws.addEventListener('open', ()=>{
                resolve(new WebSocketTransport(ws))
            }
            );
            ws.addEventListener('error', reject);
        });
    }
    constructor(ws){
        this._ws = ws;
        this._ws.addEventListener('message', (evt) => {
            if (this.onmessage) this.onmessage.call(null, evt.data);
        });
        this._ws.addEventListener('close', ()=>{
            if(this.onclose) this.onclose.call(null);
        });
        this._ws.addEventListener('error', ()=>{});
        this.onmessage = null;
        this.onclose = null;
    }
    send(msg){
        this._ws.send(msg);
    }
    close(){
        this._ws.close();
    }
}