const {pathsToModuleNameMapper} = require('ts-jest');
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper({
    "@/*": ["*"],
  }, {prefix: '<rootDir>'}),
};
