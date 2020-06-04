const rootDir = process.cwd();

module.exports = {
  verbose: true,
  rootDir,
  testMatch: [`${__dirname}/**/*.test.[jt]s?(x)`],
  testPathIgnorePatterns: ["/node_modules/", `.eslintrc.js$`, `config.js$`],
  collectCoverage: false,
  globals: {
    DEBUG: false,
    DEV_SERVER: false,
    TEST: true
  },
  moduleNameMapper: {
    "^@/(.*)": `${rootDir}/src/$1`
  }
};
