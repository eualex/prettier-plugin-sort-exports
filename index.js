const babelParser = require("prettier/parser-babel");
const typescriptParser = require("prettier/parser-typescript");

function moveExportsToEnd(ast) {
  const exports = [];
  const nonExports = [];
  const exportTypes = [];
  let existingExport = null;

  (ast?.program?.body ?? ast?.body).forEach((node) => {
    if (node.type === "ExportNamedDeclaration" && node.declaration) {
      nonExports.push(node.declaration);
      if (node.declaration.declarations) {
        node.declaration.declarations.forEach((decl) => {
          exports.push(decl.id.name);
        });
      } else {
        exports.push(node.declaration.id.name);
      }
    } else if (
      node.type === "ExportNamedDeclaration" &&
      !node.declaration &&
      node.exportKind !== "type"
    ) {
      existingExport = node;
    } else if (
      node.type === "ExportNamedDeclaration" &&
      node.exportKind === "type"
    ) {
      node.specifiers.forEach((specifier) => {
        exportTypes.push(specifier.exported.name);
      });
    } else {
      nonExports.push(node);
    }
  });

  if (!exports.length) return ast;

  const exportSpecifiers = exports.map((name) => ({
    type: "ExportSpecifier",
    local: { type: "Identifier", name },
  }));

  const typeSpecifiers = exportTypes.map((name) => ({
    type: "ExportSpecifier",
    local: { type: "Identifier", name },
    exportKind: "type",
  }));

  if (existingExport) {
    existingExport.specifiers = [
      ...existingExport.specifiers,
      ...exports.map((name) => ({
        type: "ExportSpecifier",
        local: { type: "Identifier", name },
      })),
      ...typeSpecifiers,
    ];

    nonExports.push(existingExport);
  } else {
    const exportStatement = {
      type: "ExportNamedDeclaration",
      declaration: null,
      specifiers: [
        ...exports.map((name) => ({
          type: "ExportSpecifier",
          local: { type: "Identifier", name },
        })),
        ...typeSpecifiers,
      ],
      source: null,
    };
    nonExports.push(exportStatement);
  }

  if (!ast?.program?.body) {
    ast.body = nonExports;
  } else {
    ast.program.body = nonExports;
  }

  return ast;
}

function addBlankLineBeforeExport(text) {
  const lines = text.split("\n");
  const exportIndex = lines.findIndex((line) => line.startsWith("export {"));

  if (exportIndex > 0 && lines[exportIndex - 1].trim() !== "") {
    lines.splice(exportIndex, 0, "");
  } else if (exportIndex === -1) {
    lines.push("", "export { }");
  }

  return lines.join("\n");
}

function createPluginParser(parser) {
  return {
    ...parser,
    parse: async (text, options) => {
      const ast = parser.parse(text, options);
      const transformedAST = moveExportsToEnd(ast);
      return transformedAST;
    },
    preprocess: (text, options) => {
      const ast = parser.parse(text, options);
      let body = ast?.program?.body ?? ast?.body;
      const exportsExist = body.some(
        (node) =>
          node.type === "ExportNamedDeclaration" && node.exportKind !== "type",
      );
      if (exportsExist) {
        return addBlankLineBeforeExport(text);
      }
      return text;
    },
  };
}

module.exports = {
  parsers: {
    babel: createPluginParser(babelParser.parsers.babel),
    typescript: createPluginParser(typescriptParser.parsers.typescript),
  },
};
