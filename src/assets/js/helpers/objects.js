export function shallowMerge(target, source){
  return Object.defineProperties(
    target,
    Object.getOwnPropertyDescriptors(source)
    )
}
export function type(obj){
  const s = Object.prototype.toString.call(obj);
  return s.match(/\[object (.*?)\]/)[1].toLowerCase();
}

const temp = {};

['Null',
 'Undefiend',
 'Object',
 'String',
 'Number',
 'Boolean',
 'Function',
 'RegExp' 
 ].forEach((item)=>{
   temp['is' + item] = function(obj){
     return objects.type(obj) === item.toLowerCase();
   }
 });

Object.assign(objects, temp);
