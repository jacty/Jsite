import { __ENV__ } from '@Jeact/shared/Constants';

const valueStack = [];
let index = -1;
let fiberStack;
if(__ENV__){
  fiberStack =[];
}

export function createCursor(defaultValue){
  return {
    current: defaultValue,
  };
}

export function pop(cursor, fiber){
  if (index < 0){
    if(__ENV__){
      console.error('Unexpected pop.')
    }
    return;
  }

  if(__ENV__){
    if(fiber !== fiberStack[index]){
      console.error('Unexpected Fiber popped.')
    }
  }

  cursor.current = valueStack[index];
  
  valueStack[index] = null;

  if (__ENV__){
    fiberStack[index] = null;
  }

  index --;
}

export function push(cursor, value, fiber){
  index ++;

  valueStack[index] = cursor.current;

  if (__ENV__){
    fiberStack[index] = fiber;
  }

  cursor.current = value;
}
