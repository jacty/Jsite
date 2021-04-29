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

async function waitWithTimeout(promise, taskName, timeout){
    let reject;
    const timeoutError = new Error(
        `waiting for ${taskName} failed: timeout ${timeout}ms exceeded`
    );
    const timeoutPromise = new Promise((resolve, x) => (reject = x));
    let timeoutTimer = null;
    if (timeout) timeoutTimer = setTimeout(() => reject(timeoutError), timeout);
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutTimer) clearTimeout(timeoutTimer);
    }
}

export const helper = {
    addEventListener,
    removeEventListeners,
    waitWithTimeout
}