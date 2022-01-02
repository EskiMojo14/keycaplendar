const memoImportAST = {
  source: { type: "StringLiteral", value: "react" },
  specifiers: [
    {
      imported: {
        name: "memo",
        type: "Identifier",
      },
      local: {
        name: "memo",
        type: "Identifier",
      },
      type: "ImportSpecifier",
    },
  ],
  type: "ImportDeclaration",
};

const memoCallAST = {
  callee: {
    name: "memo",
    type: "Identifier",
  },
  type: "CallExpression",
};

function template(
  { template },
  opts,
  { componentName, exports, imports, interfaces, jsx, props }
) {
  const plugins = ["jsx"];
  if (opts.typescript) {
    plugins.push("typescript");
  }

  const templatingEngine = template.smart({ plugins });

  // Filter out React import, since we use automatic jsx runtime
  imports = (imports || []).filter(
    ({ source }) => (source?.value ?? "").toLowerCase() !== "react"
  );

  if (opts.memo) {
    imports.push(memoImportAST);
  }

  exports = (exports || []).map((exportAST) =>
    exportAST.type === "VariableDeclaration"
      ? {
          ...exportAST,
          declarations: exportAST.declarations.map((declaration) => {
            if (
              declaration.init.callee.object.name === "React" &&
              declaration.init.callee.property.name === "memo"
            ) {
              return {
                ...declaration,
                init: { ...declaration.init, ...memoCallAST },
              };
            }
            return declaration;
          }),
        }
      : exportAST
  );

  const templatedComponent = templatingEngine.ast`${imports}

const ${componentName} = (${props}) =>
  ${jsx}
;

${exports}
`;

  return templatedComponent;
}

exports.default = template;
