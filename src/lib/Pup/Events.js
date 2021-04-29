// EventEmitter
export class Events{
    eventsMap = new Map();

    constructor(){
        this.emitter = mitt(this.eventsMap);
    }
    on(event, handler){
        this.emitter.on(event, handler);
        return this;
    }
    off(event, handler){
        this.emitter.off(event, handler);
        return this;
    }
    emit(event, eventData){
        this.emitter.emit(event, eventData);
        return this.eventListenersCount(event) > 0;
    }
    once(event, handler){
        const onceHandler = (eventData) =>{
            handler(eventData);
            this.off(event, onceHandler);
        };
        return this.on(event, onceHandler);
    }
    eventListenersCount(event){
        return this.eventsMap.has(event) ? this.eventsMap.get(event).length : 0;
    }
}

export function mitt(all){
    all = all || new Map();
    return {
        all,
        on(type, handler){
            const handlers = all.get(type);
            const added = handlers && handlers.push(handler);
            if (!added){
                all.set(type, [handler]);
            }
        },
        off(type, handler){
            const handlers = all.get(type);
            if (handlers){
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            }
        },
        emit(type, evt){
            (all.get(type) || []).slice().map((handler) => {handler(evt)});
            (all.get('*') || []).slice().map((handler) => {handler(type, evt)});    
        }
    }
}