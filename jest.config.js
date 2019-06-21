/* eslint-disable */
// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
