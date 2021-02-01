let isBatchingEventUpdates = false;

export function batchedEventUpdates(fn, a){
    if (isBatchingEventUpdates){
        console.error('batchedEventUpdates');
    }
    isBatchingEventUpdates = true;
    try {
        return fn(a);
    } finally {
        isBatchingEventUpdates = false;
    }
}