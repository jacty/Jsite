import {
    createCursor,
    push,
    pop
} from '@Jeact/vDOM/FiberStack';

const valueCursor = createCursor(null);

export function pushProvider(providerFiber, context, nextValue){
    push(valueCursor, context._currentValue, providerFiber);

    context._currentValue = nextValue;
}

export function popProvider(context, providerFiber){
    const currentValue = valueCursor.current;
    pop(valueCursor, providerFiber);
    context._currentValue = currentValue;
}