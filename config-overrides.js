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
            },
            compiler: "ttypescript",
          },
        },
      ],
    },
    ...moduleRules[index].oneOf,
  ];
  return config;
};
