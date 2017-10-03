import { onChange, evalInput, getState, getInput, initState, getUrl } from './state'

describe('getState', () => {
  beforeEach(initState)

  it('returns initial state when called before a state change', () => {
    // WHEN Get state
    const state = getState()
    // THEN Returns initial state
    expect(state).toEqual({
      input: '3.141592653589793',
      f64: true
    })
  })

  it('returns new state after a state change', () => {
    // GIVEN State is changed
    const { setState } = onChange(() => { })
    setState({
      input: '42',
      f64: true
    })
    // WHEN Get state
    const state = getState()
    // THEN Returns new state
    expect(state).toEqual({
      input: '42',
      f64: true
    })
  })
})

describe('onChange', () => {
  beforeEach(initState)

  describe('setInput', () => {
    it('updates state input property', () => {
      const { setInput } = onChange(() => { })
      // WHEN Set state
      setInput('PI')
      // THEN Input is updated
      expect(getState()).toEqual({
        input: 'PI',
        f64: true
      })
    })

    it('notifies all change handlers but not the source handler', () => {
      // GIVEN Two change listeners
      const emitted = []
      const { setInput: setInputFrom0 } = onChange(() => { emitted.push([0, getInput()]) })
      const { setInput: setInputFrom1 } = onChange(() => { emitted.push([1, getInput()]) })
      const { setInput: setInputFrom2 } = onChange(() => { emitted.push([2, getInput()]) })
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

    it('does not notify when state has not changed', () => {
      // GIVEN Two change listeners
      let emitted = false
      const { setInput } = onChange(() => {})
      onChange(() => { emitted = true })
      // WHEN Set input to the current value
      setInput('3.141592653589793')
      // THEN The change handler is not notified
      expect(emitted).toBe(false)
    })
  })

  describe('setState', () => {
    it('evals float32 input', () => {
      // GIVEN JavaScript input
      const { setState } = onChange(() => {})
      // WHEN Set state
      setState({
        input: 'PI * 1337 / 100',
        f64: false
      })
      // THEN State has been updated
      expect(getState()).toEqual({
        input: 'PI * 1337 / 100',
        f64: false
      })
    })
  })

  describe('setF64', () => {
    it('updates state f64 property', () => {
      // GIVEN Some float64 state
      const { setState, setF64 } = onChange(() => { })
      setState({ input: String(1 / 3), f64: true })
      // WHEN Set to float32
      setF64(false)
      // THEN Property f64 is set to false and float64 value is remembered
      expect(getState()).toEqual({
        input: '0.3333333432674408',
        f64: false,
        float64: '0.3333333333333333'
      })
    })

    it('restores float64 precision', () => {
      // GIVEN Float32 state and remembered float64 value
      const { setInput, setF64 } = onChange(() => { })
      setInput(String(1 / 3))
      setF64(false)
      expect(getState()).toEqual({
        input: '0.3333333432674408',
        f64: false,
        float64: '0.3333333333333333'
      })
      // WHEN Switch to float64 precision
      setF64(true)
      // THEN Float64 value is restored
      expect(getState()).toEqual({
        input: '0.3333333333333333',
        f64: true
      })
    })
  })
})

describe('evalInput', () => {
  it('evals input', () => {
    // GIVEN JavaScript input
    const { setInput } = onChange(() => {})
    setInput('PI * 1337 / 100')
    // WHEN Eval input
    evalInput()
    // THEN Input is evaled
    expect(getState()).toEqual({
      input: '42.00309377849553',
      f64: true
    })
  })

  it('evals input to float32', () => {
    // GIVEN JavaScript input
    const { setState } = onChange(() => {})
    setState({ input: 'PI * 1337 / 100', f64: false })
    // WHEN Eval input
    evalInput()
    // THEN Input is evaled and float64 result is remembered
    expect(getState()).toEqual({
      input: '42.00309371948242',
      f64: false,
      float64: '42.00309377849553'
    })
  })
})

describe('setFromUrl o getUrl', () => {
  const { setFromUrl, setState } = onChange(() => {})
  const testIdentity = state => {
    setState(state)
    const url = getUrl()
    expect(typeof url).toBe('string')
    initState()
    setFromUrl(url)
    expect(getState()).toEqual(state)
  }

  it('is identity for JS states', () => {
    testIdentity({ input: 'PI * 1337 / 100', f64: true })
    testIdentity({ input: 'PI * 1337 / 100', f64: false })
  })

  it('is identity for unparseable inputs', () => {
    testIdentity({ input: 'foo', f64: true })
    testIdentity({ input: 'foo', f64: false })
  })

  it('is identity for special floats', () => {
    testIdentity({ input: '0', f64: true })
    testIdentity({ input: '0', f64: false, float64: '0' })
    testIdentity({ input: '-0', f64: true })
    testIdentity({ input: '-0', f64: false, float64: '-0' })
    testIdentity({ input: 'NaN(12345)', f64: true })
    testIdentity({ input: 'NaN(12345)', f64: false, float64: 'NaN(12345)' })
    testIdentity({ input: '-NaN(12345)', f64: true })
    testIdentity({ input: '-NaN(12345)', f64: false, float64: '-NaN(12345)' })
    testIdentity({ input: 'NaN(123456789)', f64: true })
    testIdentity({ input: 'NaN(4194304)', f64: false, float64: 'NaN(123456789)' })
    testIdentity({ input: '-NaN(123456789)', f64: true })
    testIdentity({ input: '-NaN(4194304)', f64: false, float64: '-NaN(123456789)' })
    testIdentity({ input: 'Infinity', f64: true })
    testIdentity({ input: 'Infinity', f64: false, float64: 'Infinity' })
    testIdentity({ input: '-Infinity', f64: true })
    testIdentity({ input: '-Infinity', f64: false, float64: '-Infinity' })
  })

  it('is identity for inputs with escape char', () => {
    testIdentity({ input: '~', f64: true })
    testIdentity({ input: '~', f64: false })
    testIdentity({ input: '~~', f64: true })
    testIdentity({ input: '~~', f64: false })
    testIdentity({ input: '~~~42~', f64: true })
    testIdentity({ input: '~~~42~', f64: false })
  })

  it('is identity for numbers', () => {
    testIdentity({ input: '0.3333333333333333', f64: true })
    testIdentity({ input: '0.3333333432674408', f64: false, float64: '0.3333333333333333' })
    testIdentity({ input: '-0.3333333333333333', f64: true })
    testIdentity({ input: '-0.3333333432674408', f64: false, float64: '-0.3333333333333333' })
    testIdentity({ input: '1', f64: true })
    testIdentity({ input: '1', f64: false, float64: '1' })
    testIdentity({ input: '42', f64: true })
    testIdentity({ input: '42', f64: false, float64: '42' })
  })
})
