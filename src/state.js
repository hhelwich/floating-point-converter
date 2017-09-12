/**
 * Set property with given name on the new state.
 */
const setProperty = (previousState = {}, action, newState) => propName => {
  const stateVal = previousState[propName];
  const actionVal = action[propName];
  const changed = actionVal != null && actionVal !== stateVal;
  newState[propName] = changed ? actionVal : stateVal;
  return changed;
};

/**
 * Create a state, register given state change handler and return a state setter.
 */
export default changeHandler => {
  let state;
  return action => {
    const newState = {};
    const setProp = setProperty(state, action, newState);
    const changed = ['f64Str', 'f64'].map(setProp);
    if (changed.some(b => b)) {
      changeHandler(state = newState);
    }
  };
};
