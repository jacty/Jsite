function addEventListener(emitter, eventName, handler){
    emitter.on(eventName, handler);
    return {emitter, eventName, handler};
}

function removeEventListeners(listeners){
    for (const listener of listeners){
        listener.emitter.removeListener(listener.eventName, listener.handler);
    }
    listeners.length = 0;
}

export const helper = {
    addEventListener,
    removeEventListeners
}