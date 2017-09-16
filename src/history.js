import { equals } from './state'

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

export default (set, defaultState) => {
  const { history, location: { hash } } = window
  window.addEventListener('popstate', () => {
    const { state } = history
    if (state != null) {
      set(state)
    }
  })
  setTimeout(() => {
    set(hash ? urlToState(decodeURIComponent(hash.substr(1))) : defaultState)
  })
  return newState => {
    const { state } = history
    if (state == null || !equals(newState, state)) {
      history[state == null ? 'replaceState' : 'pushState'](
        newState, '', `./${encodeURIComponent(stateToUrl(newState))}`)
    }
  }
}
