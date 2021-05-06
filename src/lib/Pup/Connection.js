import {Events} from './Events.js';

export const ConnectionEmittedEvents = {
    Disconnected: Symbol('Connection.Disconnected')
}

export class Connection extends Events{
    _lastId = 0;
    _sessions = new Map();
    _closed = false;
    _callbacks = new Map();
    constructor(url, transport){
        super();
        this._url = url;
        this._transport = transport;
        this._transport.onmessage = this._onMessage.bind(this);
        this._transport.onclose = this._onClose.bind(this);
    }
    send(method, ...args){
        const params = args.length ? args[0] : undefined;
        const id = this._rawSend({method, params});
        return new Promise((resolve, reject) => {
            this._callbacks.set(id, {resolve, reject, error: new Error(), method});
        })
    }
    _rawSend(msg){
        const id = ++this._lastId;
        const stringifiedMsg = JSON.stringify(
            Object.assign({}, msg, {id})
        );;
        this._transport.send(stringifiedMsg);
        return id;
    }
    async _onMessage(msg){
        const object = JSON.parse(msg);
        if (object.method === 'Target.attachedToTarget'){
          const sessionId = object.params.sessionId;
          const session = new CDPSession(
            this,
            object.params.targetInfo.type,
            sessionId
          );
          this._sessions.set(sessionId, session);
        } else if (object.method === 'Target.detachedFromTarget'){
          const session = this._sessions.get(object.params.sessionId);
          if (session){
            session._onClosed();
            this._sessions.delete(object.params.sessionId);
          }
        }
        if (object.sessionId) {
          const session = this._sessions.get(object.sessionId);
          if (session) session._onMessage(object);
        } else if (object.id){
            const callback = this._callbacks.get(object.id);
            if (callback){
                this._callbacks.delete(object.id);
                if (object.error){
                    callback.reject(
                        createProtocolError(callback.error, callback.method, object)
                    );
                } else {
                    callback.resolve(object.result);
                }
            }
        } else {
            this.emit(object.method, object.params);
        }
    }

    _onClose(){
        if (this._closed) return;
        this._closed = true;
        this._transport.onmessage = null;
        this._transport.onclose = null;
        for (const callback of this._callbacks.values()){
            callback.reject(
                rewriteError(
                    callback.error,
                    `Protocol error (${callback.method}): Target closed.`
                )
            )
        }
        this._callbacks.clear();
        for (const session of this._sessions.values()) session._onClosed();
        this._sessions.clear();
        this.emit(ConnectionEmittedEvents.Disconnected);
    }

    dispose(){
        this._onClose();
        this._transport.close();
    }

    async createSession(targetInfo){
      const { sessionId } = await this.send('Target.attachToTarget', {
        targetId: targetInfo.targetId,
        flatten: true,
      });
      return this._sessions.get(sessionId);
    }
}

export const CDPSessionEmittedEvents = {
  Disconnected: Symbol('CDPSession.Disconnected')
}

export class CDPSession extends Events{
  constructor(connection, targetType, sessionId){
    super();
    this._connection = connection;
    this._targetType = targetType;
    this._sessionId = sessionId;

    this._callbacks = new Map();
  }
  send(method, ...paramArgs){
    if (!this._connection){
      return Promise.reject(
        new Error(
          `Protocol error (${method}): Session closed. Most likely the ${this._targetType} has been closed.`
        )
      )
    }
    const params = paramArgs.length ? paramArgs[0] : undefined;

    const id = this._connection._rawSend({
      sessionId: this._sessionId,
      method,
      params
    });

    return new Promise((resolve, reject) => {
      this._callbacks.set(id, { resolve, reject, error: new Error(), method});
    })
  }
  _onMessage(object){
    if (object.id && this._callbacks.has(object.id)){
      const callback = this._callbacks.get(object.id);
      this._callbacks.delete(object.id);
      if (object.error){
        callback.reject(
          createProtocolError(callback.error, callback.method, object)
        );
      } else {
        callback.resolve(object.result);
      }
    } else {
      this.emit(object.method, object.params);
    }
  }
  _onClosed(){
    for (const callback of this._callbacks.values()){
      callback.reject(
        rewriteError(
          callback.error,
          `Protocol error (${callback.method}): Target closed.`
        )
      )
    }
    this._callbacks.clear();
    this._connection = null;
    this.emit(CDPSessionEmittedEvents.Disconnected);
  }
}

function createProtocolError(error, method, object){
    let msg = `Protocol error (${method}): ${object.error.message}`;
    if ('data' in object.error) msg += ` ${object.error.data}`;
    return rewriteError(error, msg);
}

function rewriteError(error, msg){
    error.message = msg;
    return error;
}


