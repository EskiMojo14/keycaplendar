const memoImportAST = {
  type: "ImportDeclaration",
  specifiers: [
    {
      type: "ImportSpecifier",
      imported: {
        type: "Identifier",
        name: "memo",
      },
      local: {
        type: "Identifier",
        name: "memo",
      },
    },
  ],
  source: { type: "StringLiteral", value: "react" },
};

const memoCallAST = {
  type: "CallExpression",
  callee: {
    type: "Identifier",
    name: "memo",
  },
};

function template({ template }, opts, { imports, interfaces, componentName, props, jsx, exports }) {
  const plugins = ["jsx"];
  if (opts.typescript) {
    plugins.push("typescript");
  }

  const templatingEngine = template.smart({ plugins });

  // Filter out React import, since we use automatic jsx runtime
  imports = (imports || []).filter(({ source }) => (source ? source.value : "").toLowerCase() !== "react");

  if (opts.memo) {
    imports.push(memoImportAST);
  }

  exports = (exports || []).map((exportAST) =>
    exportAST.type === "VariableDeclaration"
      ? {
          ...exportAST,
          declarations: exportAST.declarations.map((declaration) => {
            if (declaration.init.callee.object.name === "React" && declaration.init.callee.property.name === "memo") {
              return { ...declaration, init: { ...declaration.init, ...memoCallAST } };
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
