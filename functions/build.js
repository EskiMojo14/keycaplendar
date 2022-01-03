/* eslint-disable @typescript-eslint/no-var-requires */
const glob = require("glob");

require("esbuild")
  .build({
    entryPoints: glob.sync("src/**/*.ts"),
    outdir: "lib",
    platform: "node",
    format: "cjs",
    minify: true,
    target: ["node12"],
  })
  .catch(() => process.exit(1));
