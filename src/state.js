const props = ['fStr', 'f64']

/**
 * Set property with given name on the new state.
 */
const setProperty = (previousState = {}, action, newState) => propName => {
  const stateVal = previousState[propName]
  const actionVal = action[propName]
  const changed = actionVal != null && actionVal !== stateVal
  newState[propName] = changed ? actionVal : stateVal
  return changed
}

/**
 * Returns true if the given two states are equal
 */
export const equals = (stateA, stateB) => props.every(prop => stateA[prop] === stateB[prop])

/**
 * Create a state, register given state change handler and return a state setter.
 */
export const state = changeHandler => {
  let state
  return action => {
    const newState = {}
    const setProp = setProperty(state, action, newState)
    const changed = props.map(setProp)
    if (changed.some(b => b)) {
      changeHandler(state = newState)
    }
  }
}
