function template({ template }, opts, { imports, interfaces, componentName, props, jsx, exports }) {
  const plugins = ["jsx"];
  if (opts.typescript) {
    plugins.push("typescript");
  }

  const templatingEngine = template.smart({ plugins });

  // Filter out React import, since we use automatic jsx runtime
  imports = (imports || []).filter(({ source }) => (source ? source.value : "").toLowerCase() !== "react");

  const templatedComponent = templatingEngine.ast`${imports}

const ${componentName} = (${props}) =>
  ${jsx}
;

${exports}
`;

  return templatedComponent;
}

exports.default = template;
