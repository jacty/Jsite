import {CurrentDispatcher} from '@Jeact/shared/internals';

export function useState(initialState){
    const dispatcher = CurrentDispatcher.current;
    return dispatcher.useState(initialState);
}