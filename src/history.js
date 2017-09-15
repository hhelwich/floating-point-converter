import { equals } from './state'

const { history } = window

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

const local = false

export default set => {
  window.addEventListener('popstate', () => {
    const { state } = history
    if (state != null) {
      set(window.history.state)
    }
  })
  return newState => {
    const { state } = history
    if (state == null || !equals(newState, state)) {
      history.pushState(newState, '', `${local ? '#' : './'}${encodeURIComponent(stateToUrl(newState))}`)
    }
  }
}
