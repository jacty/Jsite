export const allNativeEvents = new Set();
// topLevelEventsToReactNames
export const EventMapTovEvent = new Map();
// registrationNameDependencies
export const vEventMatchToEvent = {};
const EventNames = [
  'click',
  'error',
]
// registerSimpleEvents
for(let name of EventNames){
  const vEventName = 'on' + name[0].toUpperCase() + name.slice(1);
  EventMapTovEvent.set(name, vEventName);
  registerEvents([name], vEventName);
}

// registerTwoPhaseEvent
export function registerEvents(event, vevent){
  registerEvent(vevent, event);
  registerEvent(vevent+'Capture', event);
}
// registerDirectEvent
function registerEvent(name, dependencies){
  vEventMatchToEvent[name] = dependencies;
  for(let item of dependencies){
    allNativeEvents.add(item)
  }
}
