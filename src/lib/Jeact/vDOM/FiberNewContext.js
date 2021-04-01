import {
    createCursor,
    push
} from '@Jeact/vDOM/FiberStack';

const valueCursor = createCursor(null);

export function pushProvider(providerFiber, context, nextValue){
    push(valueCursor, context._currentValue, providerFiber);

    context._currentValue = nextValue;
}