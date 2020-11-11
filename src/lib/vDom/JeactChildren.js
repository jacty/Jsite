const SEPARATOR = '.';
const SUBSEPARATOR = ':';

 function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback){
  const type = typeof children;
  if(type === 'undefined' || type === 'boolean'){
    children = null;
  }

  let invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof){
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }
    }
  }

  if (invokeCallback){
    const child = children;
    let mappedChild = callback(child);
    console.log('mapIntoArray')
  }
 }

 function mapChildren(children, func, context){
  if (children == null) {
    return children;
  }
  const result = [];
  let count = 0;
  mapIntoArray(children, result, '', '', function(child){
    return func.call(context, child, count++)
  });
  return result;
 }

/**
* Iterates through children that are typically specified as `props.children`.
*/

function forEachChildren(children, forEachFunc, forEachContext){
  mapChildren(children, function(){forEachFunc.apply(this, arguments);}, forEachContext)
}

export {
  forEachChildren as forEach,
  mapChildren as map,
}
