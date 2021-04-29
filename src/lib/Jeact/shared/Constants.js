export const __ENV__ = import.meta.env.MODE !== 'production';
export const NoTimestamp = -1;
/*
* JeactSymbols
*/
export let JEACT_ELEMENT_TYPE = Symbol.for('Jeact.element');
export let JEACT_SUSPENSE_TYPE = Symbol.for('Jeact.suspense');
export let JEACT_OFFSCREEN_TYPE = Symbol.for('Jeact.offscreen');
export let JEACT_LAZY_TYPE = Symbol.for('Jeact.lazy');
export let JEACT_FALLBACK_TYPE = Symbol.for('Jeact.fallback');
/*
*JeactFiberTags
*/
export const HostRoot = 0;
export const FunctionComponent = 1;
export const HostComponent = 2;
export const HostText = 3;
export const SuspenseComponent = 4;
export const OffscreenComponent = 5;
export const LazyComponent = 6;
/* 
* JeactFiberWorkLoop 
*/
export const NoContext = /*             */ 0b0000000;
export const EventContext = /*          */ 0b0000010;
export const RenderContext = /*         */ 0b0000100;
export const CommitContext = /*         */ 0b0001000;
/* 
* JeactFiberLane 
*/
export const NoLanes=/*                          */ 0b0000000000000000000000000000000;
export const NoLane =/*                          */ 0b0000000000000000000000000000000;
export const EventLane =/*                        */ 0b0000000000000000000000000000001;
export const DefaultLane = /*                    */ 0b0000000000000000000000000010000;
export const RetryLanes = /*                     */ 0b0000111110000000000000000000000;
export const RetryLane1 = /*                     */ 0b0000000010000000000000000000000;
export const OffscreenLane = /*                  */ 0b1000000000000000000000000000000;

/* JeactUpdateQueue.js */
export const UpdateState = 0;
/* JeactFiberFlags.js */
export const NoFlags = /*                      */ 0b000000000000000000000;
export const Placement = /*                    */ 0b000000000000000000001;
export const Update = /*                       */ 0b000000000000000000010;
export const PlacementAndUpdate = /*           */ Placement | Update;
export const Deletion = /*                     */ 0b000000000000000000100;
export const ChildDeletion = /*                */ 0b000000000000000001000;
export const ContentReset = /*                 */ 0b000000000000000010000; 
export const Passive = /*                      */ 0b000000000010000000000;

export const HostEffectMask = /*               */ 0b000000001111111111111;

// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b000000010000000000000;
export const ShouldCapture = /*                */ 0b000000100000000000000;
export const DidCapture = /*                   */ 0b000000000000010000000;
export const BeforeMutationMask = Update | ChildDeletion;
export const MutationMask = 
    Placement | 
    Update | 
    ChildDeletion | 
    ContentReset;
export const LayoutMask = Update;
export const PassiveMask = Passive | ChildDeletion;
export const PassiveStatic = /*                */ 0b001000000000000000000;
export const StaticMask = PassiveStatic;

/* Hook Effects Tags*/
export const NoEffects = 0b000;
export const HookHasEffect = 0b001;
export const HookPassive = 0b100;

/* Timeouts */
export const noTimeout = -1;
export const NORMAL_PRIORITY_TIMEOUT = 5000;
