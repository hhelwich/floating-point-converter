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

let state

const changeHandlers = []

export const reset = () => {
  state = undefined
  changeHandlers.length = 0
}

/**
 * Create a state, register given state change handler and return a state setter.
 */
export const onChange = changeHandler => {
  changeHandlers.push(changeHandler)
  return action => {
    const newState = {}
    const setProp = setProperty(state, action, newState)
    const changed = props.map(setProp)
    if (changed.some(b => b)) {
      state = newState
      changeHandlers.forEach(handler => {
        if (handler !== changeHandler) {
          handler(state)
        }
      })
    }
  }
}
