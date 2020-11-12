import {JeactCurrentDispatcher} from '@Jeact/shared/JeactSharedInternals';
function resolveDispatcher(){
    const dispatcher = JeactCurrentDispatcher.current;
    console.error('dispatcher', dispatcher);
    return dispatcher;
}
export function useState(initialState){
    const dispatcher = resolveDispatcher();
    console.error('useState', dispatcher);
}