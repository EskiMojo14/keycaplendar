/* eslint-disable @typescript-eslint/no-var-requires */
const { alias, aliasJest, configPaths } = require("react-app-rewire-alias");

const aliasMap = configPaths("./tsconfig.paths.json");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = function override(config, env) {
  const {
    module: { rules: moduleRules },
    plugins,
  } = config;
  const index = moduleRules.findIndex((val) => "oneOf" in val);
  moduleRules[index].oneOf.unshift({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          compiler: "ttypescript",
          compilerOptions: {
            noEmit: false,
            plugins: [
              { transform: "typescript-is/lib/transform-inline/transformer" },
            ],
          },
        },
      },
    ],
  });
  plugins.push(
    new CircularDependencyPlugin({
      exclude: /node_modules/,
    })
  );
  return alias(aliasMap)(config);
};

module.exports.jest = function override(config, env) {
  config.transform["^.+\\.(js|jsx|mjs|cjs|ts|tsx)$"] = "ts-jest";
  return aliasJest(aliasMap)(config);
};
