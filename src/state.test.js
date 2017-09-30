import { onChange, getState, initState, fromUrl, toUrl } from './state'
import { fromHexStr } from './float'

describe('getState', () => {
  beforeEach(initState)

  it('returns initial state when called before a state change', () => {
    // WHEN Get state
    const state = getState()
    // THEN Returns initial state
    expect(state).toEqual({
      input: '3.141592653589793',
      float: '3.141592653589793',
      f64: true,
      bytes: fromHexStr('400921fb54442d18'),
      bits: '0100000000001001001000011111101101010100010001000010110100011000'
    })
  })

  it('returns new state after a state change', () => {
    // GIVEN State is changed
    const { setState } = onChange(() => { })
    setState({ input: '42' })
    // WHEN Get state
    const state = getState()
    // THEN Returns adapted new state
    expect(state).toEqual({
      input: '42',
      float: '42',
      f64: true,
      bytes: fromHexStr('4045000000000000'),
      bits: '0100000001000101000000000000000000000000000000000000000000000000'
    })
  })
})

describe('onChange', () => {
  beforeEach(initState)

  describe('setInput', () => {
    it('updates state input property and derived properties', () => {
      const { setInput } = onChange(() => { })
      setInput('PI')
      expect(getState()).toEqual({
        input: 'PI',
        f64: true,
        bytes: fromHexStr('400921fb54442d18'),
        float: '3.141592653589793',
        bits: '0100000000001001001000011111101101010100010001000010110100011000'
      })
    })

    it('does not notify when state has not changed', () => {
      // GIVEN Two change listeners
      let emitted = false
      const { setInput } = onChange(() => { })
      onChange(() => { emitted = true })
      // WHEN Set input to the current value
      setInput('3.141592653589793')
      // THEN The change handler is not notified
      expect(emitted).toBe(false)
    })

    it('notifies all change handlers but not the source handler', () => {
      // GIVEN Two change listeners
      const emitted = []
      const { setInput: setInputFrom0 } = onChange(({ input }) => { emitted.push([0, input]) })
      const { setInput: setInputFrom1 } = onChange(({ input }) => { emitted.push([1, input]) })
      const { setInput: setInputFrom2 } = onChange(({ input }) => { emitted.push([2, input]) })
      // WHEN Set inputs
      setInputFrom0('set from 0')
      setInputFrom2('set from 2')
      setInputFrom1('set from 1')
      // THEN The event source is not notified
      expect(emitted).toEqual([
        [1, 'set from 0'],
        [2, 'set from 0'],
        [0, 'set from 2'],
        [1, 'set from 2'],
        [0, 'set from 1'],
        [2, 'set from 1']
      ])
    })
  })
})

describe('toUrl', () => {
  it('encodes state to url', () => {
    expect(toUrl({ input: '3.14', f64: true })).toBe('3.14')
    expect(toUrl({ input: '3.14', f64: false })).toBe('~3.14')
    expect(toUrl({ input: '~3.14', f64: true })).toBe('~~3.14')
    expect(toUrl({ input: '~3.14', f64: false })).toBe('~~~3.14')
    expect(toUrl({ input: '~~~3.14', f64: true })).toBe('~~~~~~3.14')
    expect(toUrl({ input: '~~~3.14', f64: false })).toBe('~~~~~~~3.14')
  })

  it('escapes url characters', () => {
    expect(toUrl({ input: 'PI * 1337 / 100', f64: true })).toBe('PI%20*%201337%20%2F%20100')
  })
})

describe('fromUrl', () => {
  it('decodes state from url', () => {
    expect(fromUrl('3.14')).toEqual({ input: '3.14', f64: true })
    expect(fromUrl('~3.14')).toEqual({ input: '3.14', f64: false })
    expect(fromUrl('~~3.14')).toEqual({ input: '~3.14', f64: true })
    expect(fromUrl('~~~3.14')).toEqual({ input: '~3.14', f64: false })
    expect(fromUrl('~~~~3.14')).toEqual({ input: '~~3.14', f64: true })
    expect(fromUrl('~~~~~3.14')).toEqual({ input: '~~3.14', f64: false })
    expect(fromUrl('~~~~~~3.14')).toEqual({ input: '~~~3.14', f64: true })
  })

  it('decodes escaped url characters', () => {
    expect(fromUrl('PI%20*%201337%20%2F%20100')).toEqual({ input: 'PI * 1337 / 100', f64: true })
  })

  it('return undefined for malformed url encoding', () => {
    expect(fromUrl('%E0%A4%A')).toBe(undefined)
  })
})

describe('fromUrl o toUrl', () => {
  it('is identity', () => {
    const testIdentity = input => {
      expect(fromUrl(toUrl({ input, f64: true }))).toEqual({ input, f64: true })
      expect(fromUrl(toUrl({ input, f64: false }))).toEqual({ input, f64: false })
    }
    testIdentity('')
    testIdentity('3.14')
    testIdentity('1')
    testIdentity('-1')
    testIdentity('PI * 13.37')
    testIdentity('~')
    testIdentity('~~')
    testIdentity('~~~')
    testIdentity('~3.14')
    testIdentity('~~3.14')
    testIdentity('~~~3.14')
    testIdentity('PI%20*%201337%20%2F%20100')
    testIdentity('~PI%20*%201337%20%2F%20100')
    testIdentity('~~PI%20*%201337%20%2F%20100')
  })
})
