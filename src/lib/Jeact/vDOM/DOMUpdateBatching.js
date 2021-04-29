let isInsideEventHandler = false;

function discreteUpdatesImpl(fn, a, b, c, d){
  return fn(a, b, c, d);
}

export function discreteUpdates(fn, a, b, c, d){
  const prevIsInsideEventHandler = isInsideEventHandler;
  isInsideEventHandler = true;
  try {
    return discreteUpdatesImpl(fn, a, b, c, d);
  } finally {
    isInsideEventHandler = prevIsInsideEventHandler;
  }
}