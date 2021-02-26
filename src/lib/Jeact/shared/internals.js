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
