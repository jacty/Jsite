import { __ENV__ } from '@Jeact/shared/Constants';

const valueStack = [];
let index = -1;

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

  cursor.current = valueStack[index];
  
  valueStack[index] = null;

  index --;
}

export function push(cursor, value, fiber){
  index ++;
  
  valueStack[index] = cursor.current;

  cursor.current = value;
}
