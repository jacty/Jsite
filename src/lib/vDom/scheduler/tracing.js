// Set of currently traced interactions.
// Interactions "stack"-
// Meaning that newly traced interactions are appended to the previously active set.
// When an interaction goes out of scope, the previous set (if any) is restored.
let interactionsRef = null;
interactionsRef = {
  current: new Set(),
};
export {
  interactionsRef as __interactionsRef
}
