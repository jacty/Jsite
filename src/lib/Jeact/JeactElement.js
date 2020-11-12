import {
  __ENV__,  
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';
import {JeactCurrentOwner} from '@Jeact/Shared/JeactSharedInternals.js';

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
