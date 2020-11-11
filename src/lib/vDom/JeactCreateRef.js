export function createRef(){
    const refObject = {
        current: null,
    };
    if(process.env.NODE_ENV === 'production'){
        Object.seal(refObject);
    }
    return refObject;
}