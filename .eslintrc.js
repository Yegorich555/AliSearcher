// eslint-disable-next-line @typescript-eslint/no-var-requires
const pathAlias = require("./webpack.alias");

/* 
tslint won't be supported: https://github.com/palantir/tslint/issues/4534
you should use typescript-eslint/eslint-plugin: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
but you can't do it with {parser: 'babel-eslint'}: https://github.com/typescript-eslint/typescript-eslint#what-about-babel-and-babel-eslint
*/

module.exports = {
  parser: "@typescript-eslint/parser", // babel-eslint
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: ["airbnb", "prettier", "plugin:@typescript-eslint/recommended"],
  env: {
    es6: true,
    node: true,
    browser: true,
    webextensions: true
  },
  globals: {
    DEV_SERVER: true,
    DEBUG: true,
    TEST: true
  },
  plugins: ["@typescript-eslint", "json", "prettier"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/prefer-namespace-keyword": "off",
    "@typescript-eslint/no-explicit-any": "off", // ["error", { ignoreRestArgs: true, }],
    "react/jsx-one-expression-per-line": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "lines-between-class-members": "off",
    "no-return-assign": ["error", "except-parens"],
    "prettier/prettier": ["error"],
    "react/destructuring-assignment": 0,
    // "react/jsx-max-props-per-line": [1, { maximum: 1 }], //it doesn't work with prettier, you can remove prettier from rules: 'prettier/prettier'...
    // "react/jsx-first-prop-new-line": [1, "multiline"], //it doesn't work with prettier, you can remove prettier from rules: 'prettier/prettier'...
    "react/prop-types": 0,
    "react/prefer-stateless-function": 0,
    "react/react-in-jsx-scope": 0,
    "react/jsx-props-no-spreading": 0,
    "react/jsx-curly-newline": 0, // it conflicts with prettier
    "react/jsx-wrap-multilines": ["error", { arrow: true, return: true, declaration: true }],
    "react/jsx-filename-extension": 0,
    "react/state-in-constructor": 0,
    "react/button-has-type": 0,
    "react/no-access-state-in-setstate": "off",
    "import/extensions": 0,
    "no-underscore-dangle": 0,
    "no-unused-expressions": ["error", { allowShortCircuit: true }],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-alert": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-plusplus": 0,
    "no-unused-vars": 0,
    "class-methods-use-this": 0,
    "max-len": [
      "warn",
      {
        code: 120,
        tabWidth: 2,
        comments: 1000,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true
      }
    ]
  },
  overrides: [
    {
      files: ["*.ts", ".tsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "error"
      }
    }
  ],
  settings: {
    "import/resolver": {
      alias: {
        map: Object.keys(pathAlias).map(key => [key, pathAlias[key]]),
        extensions: [".ts", ".js", ".jsx", ".tsx", ".json"]
      }
    }
  }
};
