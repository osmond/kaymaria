import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

export default createJestConfig(customJestConfig);
