import {DiscreteEvent} from '@Jeact/shared/Constants';
//pair: createEventListenerWrapperWithPriority()
export function createEventListenerWrapper(domEventName){
    //Pair: getEventPriorityForPluginSystem()
    const eventPriority = 0;
    let listenerWrapper;
    switch(eventPriority){
        case DiscreteEvent:
            listenerWrapper = dispatchDiscreteEvent;
            break;
        default:
            console.error('Found non eventListenerWrapper');
    }
    return listenerWrapper.bind(domEventName);
}

export function dispatchDiscreteEvent(){
    console.error('dispatchDiscreteEvent');
}