// Global test setup
import { resetLogger } from '../index.js';
// Reset logger before each test
beforeEach(() => {
    resetLogger();
});
// Mock console methods for tests
const originalConsole = { ...console };
beforeAll(() => {
    // Mock console methods
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
});
afterAll(() => {
    // Restore original methods
    Object.assign(console, originalConsole);
});
//# sourceMappingURL=setup.js.map