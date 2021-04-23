import {
    HostRoot,
    HostComponent,
    SuspenseComponent,
    OffscreenComponent,
    ShouldCapture,
    DidCapture,
} from '@Jeact/shared/Constants';
import {popRenderLanes} from '@Jeact/vDOM/FiberWorkLoop';
import {suspenseStackCursor} from '@Jeact/vDOM/FiberSuspenseContext';
import {pop} from '@Jeact/vDOM/FiberStack';

export function unwindWork(wip, renderLanes){
    switch (wip.tag){
        case SuspenseComponent:
            // popSuspenseContext();
            pop(suspenseStackCursor)
            const flags = wip.flags;
            if (flags & ShouldCapture){
                wip.flags = (flags & ~ShouldCapture) | DidCapture;
                // Captured a suspense effect.
                return wip;
            }
            return null;
        case OffscreenComponent:
            popRenderLanes();
            return null;
        default:
            return null;
    }
}