export const allNativeEvents = new Set();
// registrationNameDependencies
export const EventMatchTovEvent = {};
const EventNames = [
  'click',
  'error',
]
// registerSimpleEvents
for(let name of EventNames){
  const vEventName = 'on' + name[0].toUpperCase() + name.slice(1);
  registerEvents([name], vEventName);
}

// registerTwoPhaseEvent
export function registerEvents(event, vevent){
  registerEvent(vevent, event);
  registerEvent(vevent+'Capture', event);
}
// registerDirectEvent
function registerEvent(name, dependencies){
  EventMatchTovEvent[name] = dependencies;
  for(let item of dependencies){
    allNativeEvents.add(item)
  }
}
