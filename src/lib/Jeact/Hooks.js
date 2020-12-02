import {CurrentDispatcher} from '@Jeact/shared/internals';

export function useState(initialState){
    const dispatcher = CurrentDispatcher.current;
    if (dispatcher === null){
        console.error('useState1')
    }
    return dispatcher.useState(initialState);
}