import {CurrentDispatcher} from '@Jeact/shared/internals';

export function useState(initialState){
    const dispatcher = CurrentDispatcher.current;
    if (dispatcher === null){
        debugger;
    }
    return dispatcher.useState(initialState);
}