import { 
    SyncLane,
    InputContinuousLane,
    DefaultLane,
    IdleLane
} from '@Jeact/shared/Constants';
import {
    getHighestPriorityLane,
    includesNonIdleWork
} from '@Jeact/vDOM/FiberLane';

export const DiscreteEventPriority = SyncLane;
export const ContinuousEventPriority = InputContinuousLane;
export const DefaultEventPriority = DefaultLane;
export const IdleEventPriority = IdleLane;

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

export function isHigherEventPriority(a, b){
    return a !== 0 && a < b;
}

export function lanesToEventPriority(lanes){
    const lane = getHighestPriorityLane(lanes);
    if (!isHigherEventPriority(DiscreteEventPriority, lane)){
        return DiscreteEventPriority;
    }
    if (!isHigherEventPriority(ContinuousEventPriority, lane)){
        return ContinuousEventPriority;
    }
    if (includesNonIdleWork(lane)){
        return DefaultEventPriority;
    }
    return IdleEventPriority;
}