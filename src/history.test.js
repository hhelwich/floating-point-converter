import { stateToUrl, urlToState } from './history'

describe('stateToUrl', () => {
  it('encodes state to url', () => {
    expect(stateToUrl({ fStr: '3.14', f64: true })).toBe('3.14')
    expect(stateToUrl({ fStr: '3.14', f64: false })).toBe('~3.14')
    expect(stateToUrl({ fStr: '~3.14', f64: true })).toBe('~~3.14')
    expect(stateToUrl({ fStr: '~3.14', f64: false })).toBe('~~~3.14')
    expect(stateToUrl({ fStr: '~~~3.14', f64: true })).toBe('~~~~~~3.14')
    expect(stateToUrl({ fStr: '~~~3.14', f64: false })).toBe('~~~~~~~3.14')
  })
})

describe('urlToState', () => {
  it('decodes state from url', () => {
    expect(urlToState('3.14')).toEqual({ fStr: '3.14', f64: true })
    expect(urlToState('~3.14')).toEqual({ fStr: '3.14', f64: false })
    expect(urlToState('~~3.14')).toEqual({ fStr: '~3.14', f64: true })
    expect(urlToState('~~~3.14')).toEqual({ fStr: '~3.14', f64: false })
    expect(urlToState('~~~~3.14')).toEqual({ fStr: '~~3.14', f64: true })
    expect(urlToState('~~~~~3.14')).toEqual({ fStr: '~~3.14', f64: false })
    expect(urlToState('~~~~~~3.14')).toEqual({ fStr: '~~~3.14', f64: true })
  })
})
