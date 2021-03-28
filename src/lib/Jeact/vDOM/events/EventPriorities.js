import { 
    DefaultLane,
} from '../../shared/Constants';

const DefaultEventPriority = DefaultLane;

const eventPriorities = new Map();

export function getEventPriority(domEventName){
    debugger;
}

export function getCurrentEventPriority(){
    const currentEvent = window.event;
    if(currentEvent === undefined){
        return DefaultEventPriority;
    }
    debugger;
    return getEventPriority(currentEvent.type);
}