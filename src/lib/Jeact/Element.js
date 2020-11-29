import {
  __ENV__,  
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';
import {CurrentOwner} from '@Jeact/Shared/internals';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasValidRef(config){
  if(__ENV__){
    if(hasOwnProperty.call(config, 'ref')){
      console.error('hasValidRef1')
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config){
  if(__ENV__){
    if(hasOwnProperty.call(config, 'key')){
      console.error('hasValidKey1')
    }
  }
  return config.key !== undefined;
}
// self: to detect `this`
const JeactElement = function(type, key, ref, self, source, owner, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,

    _owner: owner,
  };

  if(__ENV__){
    element._store = {};
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    Object.freeze(element.props);
    Object.freeze(element);
  }
  return element;
}

export function createElement(type, config, children){
  const props = {};

  let key = null;
  let ref = null;
  let source = null;
  if (config != null) {
    console.error('createElement1')
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1){
    console.error('createElement2')
  } else if (childrenLength > 1){
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++){
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  if (type && type.defaultProps) {
    console.log('createElement4')
  }
  if (__ENV__){
    if (key || ref || source){
      console.error('createElement3')
    }
  }
  return JeactElement(
    type,
    key,
    ref,
    self,
    source,
    CurrentOwner.current,
    props,
  );
}
