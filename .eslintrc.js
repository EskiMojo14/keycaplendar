// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfig = require("./tsconfig.paths.json");

const {
  compilerOptions: { paths },
} = tsconfig;

const pathGroupsOverrides = [
  {
    pattern: "react",
    group: "external",
    position: "before",
  },
  {
    pattern: "~/app/*",
    group: "internal",
    position: "before",
  },
  {
    pattern: "@i",
    group: "internal",
    position: "after",
  },
  {
    pattern: "@m/*",
    group: "object",
    position: "after",
  },
  {
    pattern: "./*.scss",
    group: "object",
    position: "after",
  },
];

module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-named-as-default": "off",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "index", "parent", "sibling"],
        pathGroups: [
          ...Object.keys(paths)
            .filter((path) => !pathGroupsOverrides.find((pathGroup) => pathGroup.pattern === path))
            .map((path) => ({
              pattern: path,
              group: "internal",
            })),
          ...pathGroupsOverrides,
        ],
        pathGroupsExcludedImportTypes: [...pathGroupsOverrides.map((pathGroup) => pathGroup.pattern)],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        warnOnUnassignedImports: true,
      },
    ],
    "object-shorthand": "error",
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: true,
      },
    ],
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "sort-imports": [
      "warn",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
