// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsconfig = require("./tsconfig.paths.json");

const {
  compilerOptions: { paths },
} = tsconfig;

const pathGroupsOverrides = {
  "./*.scss": {
    group: "object",
    pattern: "./*.scss",
    position: "after",
  },
  "@i": {
    group: "internal",
    pattern: "@i",
    position: "after",
  },
  "@m/*": {
    group: "object",
    pattern: "@m/*",
    position: "after",
  },
  "~/app/*": {
    group: "internal",
    pattern: "~/app/*",
    position: "before",
  },
  react: {
    group: "external",
    pattern: "react",
    position: "before",
  },
};

module.exports = {
  // Specifies the ESLint parser
  extends: [
    "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"], // Your TypeScript files extension
      parserOptions: {
        project: ["./tsconfig.json"], // Specify it only for TypeScript files
      },
      rules: {
        "@typescript-eslint/prefer-includes": "warn",
        "@typescript-eslint/prefer-reduce-type-parameter": "warn",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },

    ecmaVersion: 2018,
    // Allows for the parsing of modern ECMAScript features
    sourceType: "module",
  },
  plugins: ["sort-destructure-keys", "sort-keys", "typescript-sort-keys"],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "array",
      },
    ],
    "@typescript-eslint/consistent-indexed-object-style": ["warn", "record"],
    "@typescript-eslint/consistent-type-assertions": [
      "warn",
      {
        assertionStyle: "as",
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/member-delimiter-style": "warn",
    "@typescript-eslint/method-signature-style": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/sort-type-union-intersection-members": "warn",
    "arrow-body-style": ["error", "as-needed"],
    "import/newline-after-import": "error",
    "import/no-named-as-default": "off",
    "import/order": [
      "warn",
      {
        alphabetize: {
          caseInsensitive: true,
          order: "asc",
        },
        groups: [
          "builtin",
          "external",
          "internal",
          "index",
          "parent",
          "sibling",
        ],
        pathGroups: [
          ...Object.keys(paths)
            .filter((path) => !pathGroupsOverrides[path])
            .map((path) => ({
              group: "internal",
              pattern: path,
            })),
          ...Object.values(pathGroupsOverrides),
        ],
        pathGroupsExcludedImportTypes: [...Object.keys(pathGroupsOverrides)],
        warnOnUnassignedImports: true,
      },
    ],
    "no-use-before-define": "error",
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
    "prefer-template": "warn",
    "react/destructuring-assignment": ["error", "always"],
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-boolean-value": "error",
    "react/jsx-fragments": "error",
    "react/jsx-sort-props": [
      "error",
      {
        ignoreCase: true,
        reservedFirst: true,
      },
    ],
    "react/no-array-index-key": "warn",
    "sort-destructure-keys/sort-destructure-keys": [
      2,
      { caseSensitive: false },
    ],
    "sort-imports": [
      "warn",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    "sort-keys/sort-keys-fix": [
      "error",
      "asc",
      {
        caseSensitive: false,
        natural: true,
      },
    ],
    "typescript-sort-keys/interface": [
      "error",
      "asc",
      { caseSensitive: false, natural: true, requiredFirst: true },
    ],
    "typescript-sort-keys/string-enum": [
      "error",
      "asc",
      { caseSensitive: false, natural: true },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
