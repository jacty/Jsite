export const __ENV__ = import.meta.env.MODE !== 'production';
export const NoTimestamp = -1;
/*
*JeactWorkTags
*/
export const FunctionComponent = 0;
export const IndeterminateComponent = 2; // Before we know whether it is function or class
export const HostRoot = 3; // Root of a host tree.

/* JeactFiberWorkLoop */
export const NoContext = /*             */ 0b0000000;
export const DiscreteEventContext = /*  */ 0b0000100;
export const RenderContext = /*         */ 0b0010000;
export const CommitContext = /*         */ 0b0100000;

/* JeactFiberContext.js */
export const emptyContextObject = {};

/* JeactFiberLane */
export const TotalLanes = 31;
export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane = /*                         */ 0b0000000000000000000000000000000;
export const SyncLane = /*                       */ 0b0000000000000000000000000000001;
export const DefaultLanes = /*                   */ 0b0000000000000000000111000000000;
export const NonIdleLanes = /*                   */ 0b0000111111111111111111111111111;

/* core Priorities */
export const ImmediatePriority = 99;
export const NormalPriority = 97;
export const NoPriority = 90;


/* SchedulerPriorities */
export const ImmediateSchedulePriority = 1;
export const NormalSchedulePriority = 3;

/* LanePriorities */
export const NoLanePriority = 0;
export const DefaultLanePriority = 8;
export const TransitionLanePriority = 6;
export const SyncLanePriority = 15; //?

/* JeactUpdateQueue.js */
export const UpdateState = 0;

/* JeactFiberFlags.js */
export const NoFlags = /*                      */ 0b0000000000000000000;
export const PerformedWork = /*                */ 0b0000000000000000001;

export const Placement = /*                    */ 0b0000000000000000010;
export const Update = /*                       */ 0b0000000000000000100;
export const Deletion = /*                     */ 0b0000000000000001000;
export const ContentReset = /*                 */ 0b0000000000000010000;
export const Callback = /*                     */ 0b0000000000000100000;
export const Ref = /*                          */ 0b0000000000010000000;
export const Snapshot = /*                     */ 0b0000000000100000000;
export const Passive = /*                      */ 0b0000000001000000000;
export const Hydrating = /*                    */ 0b0000000010000000000;
export const Visibility = /*                   */ 0b0000000100000000000;
// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b0000001000000000000;
// Static tags describe aspects of a fiber that are not specific to a render,
// e.g. a fiber uses a passive effect (even if there are no updates on this particular render).
// This enables us to defer more work in the unmount case, since we can defer
// traversing the tree during layout to look for Passive effects, and instead
// rely on the static flag as a signal that there may be cleanup work.
export const PassiveStatic = /*                */ 0b0010000000000000000;

// Union of tags that don't get reset on clones.
// This allows certain concepts to persist without recalculating them, e.g.
// whether a subtree contains passive effects or portals.
export const StaticMask = PassiveStatic;
export const PassiveMask = Passive | Deletion;

/* Timeouts */
export const noTimeout = -1;
export const NormalTimeout = 5000;





export const BeforeMutationMask = Snapshot;
export const MutationMask = Placement | Update | Deletion | ContentReset | Ref | Hydrating | Visibility;
export const LayoutMask = Update | Callback | Ref;






