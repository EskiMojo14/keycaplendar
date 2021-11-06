import fs from "fs";
import prettier from "prettier";
import sass from "sass";
import yargs from "yargs/yargs";
import { camelCase, cloneDeep } from "lodash";
import cssToJS from "transform-css-to-js";
import { parse, stringify } from "comment-json";

const { p: format } = yargs(process.argv.slice(2))
  .options({
    p: { type: "boolean", alias: ["format", "prettier"], default: false },
  })
  .parse();

const objectEditDeep = <InputVal = string, OutputVal = string>(
  keyCB: (string: string) => string = (string) => string,
  valCB: (V: InputVal) => OutputVal = (val) => (val as unknown) as OutputVal
) => <T extends Record<string, InputVal | OutputVal>, Nested extends T | T[] | Record<string, T>>(
  input: Nested
): Nested => {
  if (typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(objectEditDeep(keyCB, valCB)) as Nested;
  return Object.fromEntries(
    Object.entries(input).map(([k, v]) => [
      keyCB(k),
      typeof v === "object" ? objectEditDeep(keyCB, valCB)(v) : valCB(v),
    ])
  ) as Nested;
};

const handleLists = (object: any): any =>
  Object.entries(object).reduce((prev, [mapName, mapVal]) => {
    const [map, theme] = mapName.split("__");
    const copy = cloneDeep(prev);
    if (typeof copy[map] === "undefined") {
      copy[map] = {};
    }
    if (typeof copy[map] === "object") {
      if (typeof mapVal === "string" || mapVal instanceof Array) {
        copy[map][theme] = mapVal;
      } else {
        if (typeof copy[map][theme] === "undefined") {
          copy[map][theme] = {};
        }
        const keyIndexRegex = /(.*)--(\d+)/;
        Object.entries(mapVal as Record<string, unknown>).forEach(([keyIndex, val]) => {
          if (typeof copy[map][theme] === "object") {
            if (keyIndexRegex.test(keyIndex)) {
              const [_full, key, index] = keyIndex.match(keyIndexRegex) as Array<string>;
              if (!(copy[map][theme][key] instanceof Array)) {
                copy[map][theme][key] = [];
              }
              copy[map][theme][key][parseInt(index) - 1] = val;
            } else {
              copy[map][theme][keyIndex] = val;
            }
          }
        });
      }
    }
    return copy;
  }, {} as any);

export const exportSCSS = (cb: () => void) => {
  const options: sass.Options = {
    file: "src/export.scss",
    includePaths: ["src/", "node_modules/"],
  };
  const result = sass.renderSync(options);
  const css = result.css.toString();
  const jsonString = cssToJS(css).replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
  const parsed = parse(jsonString);
  const editKey = (key: string) =>
    key
      .replace(/Element$/, "")
      .replace(/(graphColors|themesMap)(.*)/, (_full, group, name) => `${group}__${camelCase(name)}`)
      .replace(/ARRAY(.*)INDEX/g, (_full, name) => `ARRAY${camelCase(name)}INDEX`)
      .replace(/ARRAY(.*)INDEX(\d+)/, "$1--$2");
  const editValue = (value: string) =>
    value === "undefined" ? "" : ["true", "false"].includes(value) ? value === "true" : value;
  const processedParsed = objectEditDeep(editKey, editValue)(parsed);
  const listProcessed = handleLists(processedParsed);
  const writeFile = (data: string) => {
    fs.writeFileSync("src/theme-variables.json", data);
    cb();
  };
  if (format) {
    prettier
      .resolveConfig("src/theme-variables.json")
      .then((options) => {
        if (options) {
          writeFile(prettier.format(stringify(listProcessed), { ...options, parser: "json" }));
        } else {
          writeFile(stringify(listProcessed));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch prettier config: %s", err);
        writeFile(stringify(listProcessed));
      });
  } else {
    writeFile(stringify(listProcessed));
  }
};

export default exportSCSS;
