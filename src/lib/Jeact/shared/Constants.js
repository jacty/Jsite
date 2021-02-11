export const __ENV__ = import.meta.env.MODE !== 'production';
export const NoTimestamp = -1;
/*
* JeactSymbols
*/
export let JEACT_ELEMENT_TYPE = Symbol.for('jeact.element');
export let JEACT_CONTEXT_TYPE = Symbol.for('jeact.context');

/*
*JeactWorkTags
*/
export const FunctionComponent = 0;
export const HostRoot = 3; // Root of a host tree.
export const HostComponent = 5;
export const HostText = 6;

/* JeactFiberWorkLoop */
export const NoContext = /*             */ 0b0000000;
export const RenderContext = /*         */ 0b0010000;
export const CommitContext = /*         */ 0b0100000;
export const RetryAfterError = /*       */ 0b1000000;
/* JeactFiberLane */
export const TotalLanes = 31;
export const NoLanes=/*                          */ 0b0000000000000000000000000000000;
export const NoLane =/*                          */ 0b0000000000000000000000000000000;
export const InputDiscreteLanes = /*             */ 0b0000000000000000000000000011000;
export const DefaultLanes = /*                   */ 0b0000000000000000000111000000000;
export const TransitionLanes = /*                */ 0b0000000001111111110000000000000;
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
export const DefaultLanePriority = 1;
export const InputDiscreteLanePriority = 2;

/* JeactUpdateQueue.js */
export const UpdateState = 0;

/* JeactFiberFlags.js */
export const NoFlags = /*                      */ 0b00000000000000000000;
export const PerformedWork = /*                */ 0b00000000000000000001;
export const Placement = /*                    */ 0b00000000000000000010;
export const Update = /*                       */ 0b00000000000000000100;
export const Ref = /*                          */ 0b00000000000100000000;
export const Snapshot = /*                     */ 0b00000000001000000000;
export const Passive = /*                      */ 0b00000000010000000000;
// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b0000001000000000000;

/* Timeouts */
export const noTimeout = -1;
// Eventually times out
export const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
export const NORMAL_PRIORITY_TIMEOUT = 5000;





