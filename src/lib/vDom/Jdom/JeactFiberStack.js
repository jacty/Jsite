import { __ENV__ } from '../shared/Constants';

const valueStack = [];
let fiberStack;
let index = -1;
if (__ENV__){
  fiberStack =[];
}

export function createCursor(defaultValue){
  return {
    current: defaultValue,
  };
}

export function pop(cursor){
  if (index < 0){
    return;
  }

  cursor.current = valueStack[index];
  valueStack[index] = null;

  index --;
}

export function push(cursor, value){
  index ++;
  valueStack[index] = cursor.current;

  cursor.current = value;
}
