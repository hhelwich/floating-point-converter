import { fromNumber, toFloatStr } from './float'
import { onChange, equals } from './state'

const re = /^~+/

export const stateToUrl = ({ fStr, f64 }) => `${f64 ? '' : '~'}` + fStr.replace(re, match => match + match)

export const urlToState = url => {
  let f64 = true
  const fStr = url.replace(re, match => {
    f64 = !(match.length % 2)
    return match.substr(Math.ceil(match.length / 2))
  })
  return { fStr, f64 }
}

const defaultState = { fStr: toFloatStr(true)(fromNumber(true)(Math.PI)), f64: true }

const { history } = window

const changeHandler = newState => {
  const { state } = history
  if (state == null || !equals(newState, state)) {
    history[state == null ? 'replaceState' : 'pushState'](
      newState, '', `./${encodeURIComponent(stateToUrl(newState))}`)
  }
}

const set = onChange(changeHandler)

window.addEventListener('popstate', () => {
  const { state } = history
  if (state != null) {
    set(state)
  }
}, false)

setTimeout(() => {
  const { location: { hash } } = window
  const state = hash ? urlToState(decodeURIComponent(hash.substr(1))) : defaultState
  changeHandler(state)
  set(state)
})
