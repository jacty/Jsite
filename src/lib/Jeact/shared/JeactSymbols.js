export let JEACT_ELEMENT_TYPE = 0xeac7;
export let JEACT_FRAGMENT_TYPE = 0xeacb;


if (typeof Symbol === 'function' && Symbol.for){
    const symbolFor = Symbol.for;
    JEACT_ELEMENT_TYPE = symbolFor('jeact.element');
    JEACT_FRAGMENT_TYPE = symbolFor('jeact.fragment');
}

const MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
const FAUX_ITERATOR_SYMBOL = '@@iterator';

export function getIteratorFn(){
    console.log(1)
}
