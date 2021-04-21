import {JEACT_LAZY_TYPE} from '@Jeact/shared/Constants';

const Uninitialized = -1;
const Pending = 0;
const Resolved = 1;
const Rejected = 2;

function lazyInitializer(payload){
    if (payload._status === Uninitialized){
        const ctor = payload._result;
        const thenable = ctor();
        const pending = payload;
        pending._status = Pending;
        pending._result = thenable;
        thenable.then(
            moduleObject =>{
                if(payload._status === Pending){
                    const defaultExport = moduleObject.default;
                    const resolved = payload;
                    resolved._status = Resolved;
                    resolved._result = defaultExport;
                }
            },
            error =>{
                if (payload._status === Pending){
                    const rejected = payload;
                    rejected_status = Rejected;
                    rejected._result = error;
                }
            },
        );
    }
    if (payload._status === Resolved){
        return payload._result;
    } else {
        throw payload._result;
    }
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