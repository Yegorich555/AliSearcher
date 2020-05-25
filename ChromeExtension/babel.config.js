module.exports = api => {
  const isTest = api.env("test");
  return {
    presets: [
      "@babel/preset-react", // optional: react: this resolves react-files (jsx, tsx)
      "@babel/preset-typescript", // allows  to use TypeScript
      [
        "@babel/preset-env", // allows you to use the latest JavaScript
        isTest
          ? {
              targets: {
                node: "current"
              }
            }
          : {}
      ]
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties", // transforms static class properties as well as properties declared with the property initializer syntax
      "jsx-classnames-advanced" // optional: react: this resolves className={object}
    ]
  };
};
