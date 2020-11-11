import JeactCurrentOwner from './JeactCurrentOwner.js';
import {JEACT_ELEMENT_TYPE} from './JeactSymbols.js'

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};
function hasValidRef(config){
  return config.ref !== undefined;
}

function hasValidKey(config){
  return config.key !== undefined;
}

const JeactElement = function(type, key, ref, self, source, owner, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,

    _owner: owner,
  }

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
        console.log('hasValidRef is True');
    }
    if (hasValidKey(config)){
      console.log('hasValidKey is True');
    }
    for (propName in config){
      if(
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ){
          props[propName] = config[propName];//Key method of this part
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1){
    props.children = children;
  } else if (childrenLength > 1){
    console.log('childrenLength > 1')
  }

  // Resolve default props
  if (type && type.defaultProps) {
    console.log('type.defaultProps is True')
  }
  return JeactElement(
    type,
    key,
    ref,
    self,
    source,
    JeactCurrentOwner.current,
    props,
  );
}
