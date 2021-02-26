import {
  __ENV__,  
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;
// Attributes reserved for internal usage.
const RESERVED_ATTR = {
  key: true,
  ref: true,
};

function JeactElement(type, key, ref, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,
  };

  return element;
};

/**
* @arg comp: Component|DOM
* @arg attrs: attributes attached on {comp}
* @arg children: Children of {comp}
*/
export function createElement(comp, attrs, children){
  let propName; // key in object {attrs}
  const props = {};// To keep items from {attrs}
  let key = null;
  let ref = null;

  if (attrs != null) {
    ref = attrs.ref=== undefined ? null : attrs.ref; //TD:Support string ref ?
    key = attrs.key=== undefined ? null : '' + attrs.key;

    for (propName in attrs){
      if(attrs.hasOwnProperty(propName)&&
          !RESERVED_ATTR.hasOwnProperty(propName)
      ){
        props[propName] = attrs[propName];
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1){ 
    // arguments[2] will be set to props.children.
    props.children = children;
  } else if (childrenLength > 1){
    // more than one child node in the tree.
    props.children = [...arguments].slice(2,childrenLength+2);
  }

  return JeactElement(
    comp,
    key,
    ref,
    props,
  );
}
