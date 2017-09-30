import { evalFloatStr, toFloatStr, fromFloatStr, toBitsStr, fromBitsStr } from './float'
import { defaultState } from './config'

let state
let changeHandlers

const decorate = ({ input, f64 }) => {
  const float = evalFloatStr(f64)(input)
  const bytes = fromFloatStr(f64)(float)
  const bits = toBitsStr(bytes)
  return { input, f64, bytes, float, bits }
}

export const initState = () => {
  state = decorate(defaultState)
  changeHandlers = []
}

initState()

const re = /^~+/

export const toUrl = ({ input, f64 }) =>
  `${encodeURIComponent((f64 ? '' : '~') + input.replace(re, match => match + match))}`

export const fromUrl = url => {
  let f64 = true
  try {
    url = decodeURIComponent(url)
  } catch (_) {
    return
  }
  const input = url.replace(re, match => {
    f64 = !(match.length % 2)
    return match.substr(Math.ceil(match.length / 2))
  })
  return { input, f64 }
}

/** Returns true if arguments are not equal */
const notEquals = a => b => a !== b

/** Notify all change handler but not the event source */
const notifyHandlers = sourceHandler => {
  changeHandlers.filter(notEquals(sourceHandler)).forEach(handler => {
    handler(state)
  })
}

const otherIfUndefined = (a, b) => a != null ? a : b

const setState = ({ input, f64 }, sourceHandler) => {
  input = otherIfUndefined(input, state.input)
  f64 = otherIfUndefined(f64, state.f64)
  if (f64 !== state.f64 || input !== state.input) {
    state = decorate({ input, f64 })
    notifyHandlers(sourceHandler)
  }
}

/**
 * Create a state, register given state change handler and return a state setter.
 */
export const onChange = changeHandler => {
  changeHandlers.push(changeHandler)
  return {
    setInput (input) {
      setState({ input }, changeHandler)
    },
    evalInput () {
      setState({ input: state.float })
    },
    setBits (bits) {
      const { f64 } = state
      const expectedLength = f64 ? 64 : 32
      bits = bits.replace(/[^1]/g, '0') // Assure string contains only chars '0' and '1'
      if (bits.length !== expectedLength) {
        // Assure correct length and fill with trailing zeros if neccesary
        bits = bits.concat(Array(65).join('0')).slice(0, expectedLength)
      }
      setState({ input: toFloatStr(f64)(fromBitsStr(bits)) }, changeHandler)
    },
    setF64 (f64) {
      setState({ f64 }, changeHandler)
    },
    setState (state) {
      setState(state, changeHandler)
    }
  }
}

export const getBits = () => state.bits

export const getState = () => state

setTimeout(notifyHandlers)
