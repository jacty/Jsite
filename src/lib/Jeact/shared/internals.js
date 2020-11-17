/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
export const CurrentOwner = {
  current: null,
};

/**
* Keeps track of the current batch's configuration such as how long an update
* should suspend for if it needs to.
*/
export const CurrentBatchConfig = {
  transition: 0,
}

/**
 * Keeps track of the current dispatcher.
 */
export const CurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null,
};

