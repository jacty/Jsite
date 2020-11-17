import {CurrentDispatcher} from '@Jeact/shared/internals';
function resolveDispatcher(){
    const dispatcher = CurrentDispatcher.current;
    console.error('dispatcher', dispatcher);
    return dispatcher;
}
export function useState(initialState){
    const dispatcher = resolveDispatcher();
    console.error('useState', dispatcher);
}