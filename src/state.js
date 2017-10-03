import { evalFloatStr, toFloatStr, fromFloatStr, toBitsStr, fromBitsStr, evalJsStr, assureFloatStr } from './float'
import { defaultState } from './config'

/**
 * Current app state. Properties are:
 * 
 * input:   The value of the float input field
 * f64:     The value of the bit count radio buttons
 * float64: The input number in float64 precision (only set if input is no JavaScript and f64 is false)
 */
let state
let changeHandlers

export const initState = () => {
  state = defaultState
  changeHandlers = []
}

initState()

const re = /^~+/

const toUrl = ({ input, f64, float64 }) =>
  `${encodeURIComponent((f64 ? '' : '~') + (float64 == null ? input : float64).replace(re, match => match + match))}`

const fromUrl = url => {
  let f64 = true
  try {
    url = decodeURIComponent(url)
  } catch (_) {
    return
  }
  let input = url.replace(re, match => {
    f64 = !(match.length % 2)
    return match.substr(Math.ceil(match.length / 2))
  })
  let float64
  if (!f64) {
    const bytes32 = fromFloatStr(false)(input)
    if (bytes32 != null) { // Valid number string
      // Possible unwanted precision loss here => remember float64
      float64 = assureFloatStr(true)(input)
      input = toFloatStr(false)(bytes32)
    }
  }
  return { input, f64, float64 }
}

/** Returns true if arguments are not equal */
const notEquals = a => b => a !== b

/** Notify all change handler but not the event source */
const notifyHandlers = sourceHandler => {
  changeHandlers.filter(notEquals(sourceHandler)).forEach(handler => { handler() })
}

const stateEquals = (a, b) => a === b || (a.input === b.input && a.f64 === b.f64 && a.float64 === b.float64)

const maybeNotify = (fn, sourceHandler) => arg => {
  const prevState = state
  fn(arg)
  if (!stateEquals(state, prevState)) {
    notifyHandlers(sourceHandler)
  }
}

const setInput = input => {
  const currentInput = state.float64 != null ? state.float64 : state.input
  if (input !== currentInput) {
    const { f64 } = state
    let float64
    if (!f64) {
      const bytes32 = fromFloatStr(false)(input)
      if (bytes32 != null) { // Valid number string
        // Possible unwanted precision loss here => remember float64
        float64 = assureFloatStr(true)(input)
        input = toFloatStr(false)(bytes32)
      }
    }
    state = { input, f64, float64 }
  }
}

const setF64 = f64 => {
  if (f64 !== state.f64) {
    let { input } = state
    let float64
    if (f64) {
      if (state.float64 != null) {
        input = state.float64
      }
    } else {
      const bytes32 = fromFloatStr(false)(input)
      if (bytes32 != null) { // Valid number string
        // Possible unwanted precision loss here => remember float64
        float64 = assureFloatStr(true)(input)
        input = toFloatStr(false)(bytes32)
      }
    }
    state = { input, f64, float64 }
  }
}

const setFromUrl = url => {
  state = fromUrl(url) || {}
}

const setBits = bits => {
  const { f64 } = state
  const expectedLength = f64 ? 64 : 32
  bits = bits.replace(/[^1]/g, '0') // Assure string contains only chars '0' and '1'
  if (bits.length !== expectedLength) {
    // Assure correct length and fill with trailing zeros if neccesary
    bits = bits.concat(Array(65).join('0')).slice(0, expectedLength)
  }
  const input = toFloatStr(f64)(fromBitsStr(bits))
  setInput(input)
}

const setState = newState => {
  state = newState
}

export const evalInput = maybeNotify(() => {
  const { f64 } = state
  let { input, float64 } = state
  const bytes64 = fromFloatStr(true)(input)
  if (!bytes64) { // Cannot parse string as number
    input = evalJsStr(true, input)
    if (!f64) {
      float64 = input
      input = assureFloatStr(false)(input)
    }
  } else {
    if (!f64) {
      float64 = input
    }
  }
  state = { input, f64, float64 }
})

/**
 * Create a state, register given state change handler and return a state setter.
 */
export const onChange = changeHandler => {
  changeHandlers.push(changeHandler)
  return {
    setState: maybeNotify(setState, changeHandler),
    setInput: maybeNotify(setInput, changeHandler),
    setF64: maybeNotify(setF64, changeHandler),
    setFromUrl: maybeNotify(setFromUrl, changeHandler),
    setBits: maybeNotify(setBits, changeHandler)
  }
}

export const getState = () => state

export const getInput = () => state.input

export const getF64 = () => state.f64

export const getBytes = () => fromFloatStr(state.f64)(evalFloatStr(state.f64)(state.input))

export const getBits = () => toBitsStr(getBytes())

export const getUrl = () => toUrl(state)

setTimeout(notifyHandlers)
