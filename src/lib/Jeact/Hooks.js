import {CurrentDispatcher} from '@Jeact/shared/internals';

export function useState(initialState){
    const dispatcher = CurrentDispatcher.current;
    return dispatcher.useState(initialState);
}

export function useEffect(create, deps){
    const dispatcher = CurrentDispatcher.current;
    return dispatcher.useEffect(create, deps);
}