import { onChange, getState, getUrl } from './state'

const { history } = window

let historyPushType = 'replaceState'

const { setState, setFromUrl } = onChange(() => {
  history[historyPushType](getState(), '', `./${getUrl()}`)
  historyPushType = 'pushState'
})

addEventListener('popstate', ({ state }) => {
  if (state != null) { // State can be null on page load (Chrome < 34 and Safari) => ignore
    setState(state)
  }
}, false)

const { location: { hash } } = window
if (hash.length > 0) {
  setFromUrl(hash.substr(1))
}
