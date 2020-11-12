
/**
* Keeps track of the current batch's configuration such as how long an update
* should suspend for if it needs to.
*/
const JeactCurrentBatchConfig = {
  transition: 0,
}

/**
 * Keeps track of the current dispatcher.
 */
const JeactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null,
};
/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
const JeactCurrentOwner = {
  current: null,
};

const JeactSharedInternals = {
  JeactCurrentDispatcher,
  JeactCurrentBatchConfig,
  JeactCurrentOwner
}

export {JeactSharedInternals}
