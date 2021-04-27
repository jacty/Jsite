import {helper} from './helper.js';
import {Events} from './Events.js';
import {ConnectionEmittedEvents} from './Connection.js';
import {Target} from './Target.js'
export const BrowserEmittedEvents = {
    Disconnected:'disconnected',
    TargetChanged:'targetchanged',
    TargetCreated:'targetcreated',
    TargetDestroyed:'targetdestroyed'
}
export const BrowserContextEmittedEvents = {
    TargetChanged:'targetchanged',
    TargetCreated:'targetcreated',
    TargetDestroyed:'targetdestroyed'
}

export class Browser extends Events{
    static async create(
        connection,
        contextIds,
        process,
        closeCallback
    ){
        const browser = new Browser(
            connection,
            contextIds,
            process,
            closeCallback
        );
        await connection.send('Target.setDiscoverTargets', {discover: true});
        return browser;
    }
    constructor(
        connection,
        contextIds,
        process,
        closeCallback
    ){
        super();
        this._process = process;
        this._connection = connection;
        this._closeCallback = closeCallback || function(){};

        this._defaultContext = new BrowserContext(this._connection, this, null);
        this._contexts = new Map();
        for(const contextId of contextIds){
            this._contexts.set(
                contextId,
                new BrowserContext(this._connection, this, contextId)
            )
        }
        this._targets = new Map();
        this._connection.on(ConnectionEmittedEvents.Disconnected, ()=>
            this.emit(BrowserEmittedEvents.Disconnected)
        );
        this._connection.on('Target.targetCreated', this._targetCreated.bind(this));
        this._connection.on('Target.targetDestroyed',this._targetDestroyed.bind(this));
        this._connection.on('Target.targetInfoChanged', this._targetInfoChanged.bind(this));
    }
    async _targetCreated(event){
        const targetInfo = event.targetInfo;
        const { browserContextId } = targetInfo;
        const context = 
            browserContextId && this._contexts.has(browserContextId)
            ? this._contexts.get(browserContextId)
            : this._defaultContext;

        const target = new Target(
            targetInfo,
            context,
            () => this._connection.createSession(targetInfo),
        )

        this._targets.set(targetInfo.targetId, target);
        
        if (await target._initializedPromise){
            this.emit(BrowserEmittedEvents.TargetCreated, target);
            context.emit(BrowserContextEmittedEvents.TargetCreated, target);
        }
    }

    async _targetDestroyed(event){
        const target = this._targets.get(event.targetId);
        target._initializedCallback(false);
        this._targets.delete(event.targetId);
        target._closedCallback();
        if(await target._initializedPromise){
            this.emit(BrowserEmittedEvents.TargetDestroyed, target);
            target
                .browserContext()
                .emit(BrowserContextEmittedEvents.TargetDestroyed, target);
        }
    }
    async newPage(){
        return this._defaultContext.newPage();
    }
    _targetInfoChanged(event){
        const target = this._targets.get(event.targetInfo.targetId);
        const previousURL = target.url();
        const wasInitialized = target._isInitialized;
        target._targetInfoChanged(event.targetInfo);
        if (wasInitialized && previousURL !== target.url()){
            this.emit(BrowserEmittedEvents.TargetChanged, target);
            target
                .browserContext()
                .emit(BrowserContextEmittedEvents.TargetChanged, target);
        }
    }
    targets(){
        return Array.from(this._targets.values()).filter(
            (target) => target._isInitialized
        );
    }
    async waitForTarget(predicate, options={}){
        const {timeout = 30000} = options;
        const existingTarget = this.targets().find(predicate);
        if (existingTarget) return existingTarget;
        let resolve;
        const targetPromise = new Promise((x) => (resolve = x));
        this.on(BrowserEmittedEvents.TargetCreated, check);
        this.on(BrowserEmittedEvents.TargetChanged, check);
        try {
            if (!timeout) return await targetPromise;
            return await helper.waitWithTimeout(
                targetPromise,
                'target',
                timeout
            );
        } finally {
            this.off(BrowserEmittedEvents.TargetCreated, check);
            this.off(BrowserEmittedEvents.TargetChanged, check);
        }
        
        function check(target){
            if (predicate(target)) resolve(target);
        }
    }
    async close(){
        await this._closeCallback.call(null);
        this.disconnect();
    }
    disconnect(){
        this._connection.dispose();
    }
}

export class BrowserContext extends Events{
    constructor(connection, browser, contextId){
        super();
        this._connection = connection;
        this._browser = browser;
        this._id = contextId;
    }
    newPage(){
        console.error('newPage');
    }
    browser(){
        return this._browser;
    }
}