import { __ENV__ } from './Constants';

export function invariant(condition, msg){
  if (__ENV__){
    if(!condition){
      console.error(msg);
    }
  }
}
