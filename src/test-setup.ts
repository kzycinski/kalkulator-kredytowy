import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  ;(globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver
}
