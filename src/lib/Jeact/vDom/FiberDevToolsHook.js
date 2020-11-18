let injectedHook = null;

export function onScheduleRoot(root, children){
    if (injectedHook){
        console.error('onScheduleRoot', injectedHook)
    }
}