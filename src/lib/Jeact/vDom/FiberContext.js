import { createCursor } from '@Jeact/vDOM/FiberStack';

// A cursor to a boolean indicating whether the context has changed.
const didPerformWorkStackCursor = createCursor(false);

export function hasContextChanged(){
  return didPerformWorkStackCursor.current;
}
