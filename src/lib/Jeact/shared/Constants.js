export const __ENV__ = import.meta.env.MODE !== 'production';
export const NoTimestamp = -1;
/*
* JeactSymbols
*/
export let JEACT_ELEMENT_TYPE = Symbol.for('Jeact.element');
export let JEACT_CONTEXT_TYPE = Symbol.for('Jeact.context');
export let JEACT_SUSPENSE_TYPE = Symbol.for('Jeact.suspense');
export let JEACT_LAZY_TYPE = Symbol.for('Jeact.lazy');
/*
*JeactWorkTags
*/
export const FunctionComponent = 0;
export const HostRoot = 3; // Root of a host tree.
export const HostComponent = 5;
export const HostText = 6;
export const SuspenseComponent = 13;
export const LazyComponent = 16;

/* JeactFiberWorkLoop */
export const NoContext = /*             */ 0b0000000;
export const DiscreteEventContext = /*  */ 0b0000100;
export const RenderContext = /*         */ 0b0010000;
export const CommitContext = /*         */ 0b0100000;
export const RetryAfterError = /*       */ 0b1000000;
/* JeactFiberLane */
export const NoLanes=/*                          */ 0b0000000000000000000000000000000;
export const NoLane =/*                          */ 0b0000000000000000000000000000000;
export const InputDiscreteLane = /*             */ 0b0000000000000000000000000001000;
export const DefaultLane = /*                    */ 0b0000000000000000000000010000000;
export const TransitionLanes = /*                */ 0b0000000001111111110000000000000;
export const NonIdleLanes = /*                   */ 0b0001111111111111111111111111111;

/* core Priorities */
export const ImmediatePriority = 99;
export const NormalPriority = 97;
export const NoPriority = 90;

/* SchedulerPriorities */
export const ImmediateSchedulePriority = 1;
export const NormalSchedulePriority = 3;

/* LanePriorities */
export const NoLanePriority = 0;
export const DefaultLanePriority = 1;
export const InputDiscreteLanePriority = 2;

/* JeactUpdateQueue.js */
export const UpdateState = 0;
/* JeactFiberFlags.js */
export const NoFlags = /*                      */ 0b0000000000000000000000;
export const PerformedWork = /*                */ 0b0000000000000000000001;
export const Placement = /*                    */ 0b0000000000000000000010;
export const Update = /*                       */ 0b0000000000000000000100;
export const PlacementAndUpdate = /*           */ Placement | Update;
export const Deletion = /*                     */ 0b0000000000000000001000;
export const ChildDeletion = /*                */ 0b0000000000000000010000;
export const ContentReset = /*                 */ 0b0000000000000000100000; 
export const DidCapture = /*                   */ 0b0000000000000010000000;
export const Ref = /*                          */ 0b0000000000000100000000;
export const Snapshot = /*                     */ 0b0000000000001000000000;
export const Passive = /*                      */ 0b0000000000010000000000;


// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b0000000010000000000000;
export const ShouldCapture = /*                */ 0b0000000100000000000000;
export const BeforeMutationMask = Update | Snapshot | ChildDeletion;
export const MutationMask = 
    Placement | 
    Update | 
    ChildDeletion | 
    ContentReset |
    Ref;
export const LayoutMask = Update | Ref;
export const PassiveMask = Passive | ChildDeletion;
/* Timeouts */
export const noTimeout = -1;
// Eventually times out
export const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
export const NORMAL_PRIORITY_TIMEOUT = 5000;





