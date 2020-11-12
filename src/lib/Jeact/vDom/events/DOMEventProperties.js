import { ContinuousEvent } from '../../shared/Constants';
const eventPriorities = new Map();

export function getEventPriorityForPluginSystem(domEventName){
  const priority = eventPriorities.get(domEventName);
  // Default to a ContinuousEvent.
  return priority === undefined ? ContinuousEvent : priority;
}
