module.exports = {
  extends: ["plugin:jest/recommended"],
  plugins: ["jest"],
  rules: {
    "jest/expect-expect": "off",
    "jest/no-commented-out-tests": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-function": "off",
    "no-return-assign": "off",
    "max-classes-per-file": "off",
    "prefer-promise-reject-errors": "off"
  }
};
