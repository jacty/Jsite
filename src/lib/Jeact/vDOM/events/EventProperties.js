import { ContinuousEvent } from '../../shared/Constants';
const eventPriorities = new Map();

export function getEventPriority(domEventName){
  const priority = eventPriorities.get(domEventName);
  // Default to a ContinuousEvent.
  return priority === undefined ? ContinuousEvent : priority;
}
