import {createCursor} from '@Jeact/vDOM/FiberStack';

const DefaultSuspenseContext = 0b00;

// InvisibleParentSuspenseContext indicates that one of our parent Suspense 
// boundaries is not currently showing visible main content.
// Either because it is already showing a fallback or is not mounted at all.
// We can use this to determine if it is desirable to trigger a fallback at
// the parent. If not, then we might need to trigger undesirable boundaries
// and/or suspend the commit to avoid hiding the parent content. 
export const InvisibleParentSuspenseContext = 0b01;

export const suspenseStackCursor = createCursor(DefaultSuspenseContext);
