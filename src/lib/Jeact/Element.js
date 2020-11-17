import {
  __ENV__,  
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';
import {CurrentOwner} from '@Jeact/Shared/internals.js';

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

// Todo: Remove argument self.
const JeactElement = function(type, key, ref, self, source, owner, props){
  const element = {
    // to identify if this is a Jeact Element.
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,

    _owner: owner,
  };

  return element;
}

export function createElement(type, config, children){

  let propName;

  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    if (hasValidRef(config)){
      console.error('createElement1');
    }
    if (hasValidKey(config)){
      console.error('createElement1.1')
    }
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config){
      if (hasOwnProperty.call(config, propName)){
        props[propName] = config[propName];
      }
    }
  }

  const childrenLength = arguments.length - 2;

  if (childrenLength === 1){
    props.children = children;
  } else if (childrenLength > 1){
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++){
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    console.log('createElement2')
  }
  if (__ENV__){
    if (key || ref){
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
