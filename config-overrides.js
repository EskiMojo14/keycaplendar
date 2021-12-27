/* eslint-disable @typescript-eslint/no-var-requires */
const { alias, aliasJest, configPaths } = require("react-app-rewire-alias");

const aliasMap = configPaths("./tsconfig.paths.json");

module.exports = function override(config, env) {
  const moduleRules = config.module.rules;
  const index = moduleRules.findIndex((val) => "oneOf" in val);
  moduleRules[index].oneOf = [
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              noEmit: false,
              plugins: [{ transform: "typescript-is/lib/transform-inline/transformer" }],
            },
            compiler: "ttypescript",
          },
        },
      ],
    },
    ...moduleRules[index].oneOf,
  ];
  return alias(aliasMap)(config);
};

module.exports.jest = function override(config, env) {
  config.transform["^.+\\.(js|jsx|mjs|cjs|ts|tsx)$"] = "ts-jest";
  return aliasJest(aliasMap)(config);
};
