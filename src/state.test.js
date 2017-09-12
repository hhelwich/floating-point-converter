import createState from './state';

describe('set', () => {

  it('notifies change handler', () => {
    // GIVEN Initial state
    let newState;
    const set = createState(state => { newState = state; });
    set({ f64Str: '42', f64: true });
    // WHEN New state is set
    set({ f64Str: '0', f64: false });
    // THEN Change handler has been called with the new state
    expect(newState).toEqual({ f64Str: '0', f64: false });
  });

  it('only updates given properties', () => {
    // GIVEN Initial state
    let newState;
    const set = createState(state => { newState = state; });
    set({ f64Str: '0', f64: true });
    // WHEN Only one property is set
    set({ f64Str: '1' });
    // THEN Only the given property is changed
    expect(newState).toEqual({ f64Str: '1', f64: true });
  });

  it('does not emit change event when properties are not changed', () => {
    // GIVEN Initial state
    let changeHandlerCalled;
    const set = createState(() => { changeHandlerCalled = true; });
    set({ f64Str: '0', f64: true });
    changeHandlerCalled = false;
    // WHEN Properties are set with the same value
    set({ f64Str: '0' });
    set({ f64: true });
    set({});
    set({ f64Str: '0', f64: true });
    // THEN Change handler is not called
    expect(changeHandlerCalled).toBe(false);
  });

  it('remembers state changes', () => {
    // GIVEN Initial state
    const states = [];
    const set = createState(state => states.push(state));
    set({ f64Str: '0', f64: true });
    // WHEN Apply multiple state changes
    set({ f64Str: '42' });
    set({ f64: false });
    set({ f64Str: '1', f64: true });
    // THEN Emit applied states
    expect(states).toEqual([
      { f64Str: '0', f64: true },
      { f64Str: '42', f64: true },
      { f64Str: '42', f64: false },
      { f64Str: '1', f64: true },
    ]);
  });

});
