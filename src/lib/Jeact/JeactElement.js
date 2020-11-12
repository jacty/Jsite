import {__ENV__} from '@Jeact/shared/Constants';
import {JeactCurrentOwner} from '@Jeact/Shared/JeactSharedInternals.js';
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
    console.error('createElement1');
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
    JeactCurrentOwner.current,
    props,
  );
}
