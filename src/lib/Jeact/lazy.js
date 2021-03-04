import {JEACT_LAZY_TYPE} from '@Jeact/shared/Constants';

function lazyInitializer(payload){
    debugger;
}

export function lazy(ctor){
    const payload = {
        _status: -1,
        _result: ctor,
    };
    const lazyType = {
        $$typeof: JEACT_LAZY_TYPE,
        _payload: payload,
        _init: lazyInitializer,
    };

    return lazyType;
}