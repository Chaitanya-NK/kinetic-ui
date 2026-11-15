// Generates apps/docs/src/generated/props.json: the props of every exported component, read from the TypeScript source
// (type, required, default from the destructuring, and the JSDoc comment). Runs after the packages are built.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const dirs = [`${root}packages/ui/src/components`, `${root}packages/motion/src`];
const files = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".tsx")).map((f) => `${d}/${f}`));

const program = ts.createProgram(files, {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
});
const checker = program.getTypeChecker();
const isOurs = (decl) => decl && !decl.getSourceFile().fileName.includes("node_modules");
const fmt = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope | ts.TypeFormatFlags.WriteArrowStyleSignature;

function clean(type) {
  let t = type
    .replace(/\s*\|\s*undefined/g, "")
    .replace(/import\("[^"]+"\)\./g, "")
    .replace(/React\./g, "")
    .replace(/ReactElement<unknown, string \| JSXElementConstructor<any>>/g, "ReactElement")
    .replace(/\s+/g, " ");
  // class-variance-authority variants come through as `"a" | "b" | null`; null isn't a value you'd pass.
  if (/^("[^"]*"\s*\|\s*)+null$/.test(t)) t = t.replace(/\s*\|\s*null$/, "");
  if (t.length > 140) t = `${t.slice(0, 137)}…`;
  return t;
}

/** Find the props parameter of an exported component declaration. */
function propsParam(node) {
  if (ts.isFunctionDeclaration(node)) return { name: node.name?.text, fn: node };
  if (ts.isVariableStatement(node)) {
    const d = node.declarationList.declarations[0];
    if (!d || !ts.isIdentifier(d.name) || !d.initializer) return null;
    let init = d.initializer;
    // React.forwardRef(...) / forwardRef<...>((props, ref) => ...) / memo(...)
    while (ts.isCallExpression(init) && init.arguments[0]) init = init.arguments[0];
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return { name: d.name.text, fn: init };
  }
  return null;
}

const out = {};
for (const file of files) {
  const sf = program.getSourceFile(file);
  const slug = basename(file, ".tsx");
  const comps = [];
  for (const node of sf.statements) {
    const exported = ts.getCombinedModifierFlags(node.declarationList?.declarations?.[0] ?? node) & ts.ModifierFlags.Export || node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    const found = propsParam(node);
    if (!found?.name || !/^[A-Z]/.test(found.name) || found.fn.parameters.length === 0) continue;
    const param = found.fn.parameters[0];
    const type = checker.getTypeAtLocation(param);
    const defaults = {};
    if (ts.isObjectBindingPattern(param.name)) {
      for (const el of param.name.elements) {
        const key = el.propertyName?.getText() ?? el.name.getText();
        if (el.initializer) defaults[key] = el.initializer.getText().replace(/\s+/g, " ");
      }
    }
    const props = [];
    const inherited = new Set();
    for (const sym of checker.getPropertiesOfType(checker.getApparentType(type))) {
      const decl = sym.declarations?.[0];
      if (!isOurs(decl)) {
        const parent = decl?.parent;
        const n = parent && (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) ? parent.name.text : null;
        if (n && /Attributes|Props$/.test(n)) inherited.add(n.replace(/^(All)?/, ""));
        continue;
      }
      if (sym.name === "children" && !ts.displayPartsToString(sym.getDocumentationComment(checker))) {
        props.push({ name: "children", type: "ReactNode", required: !(sym.flags & ts.SymbolFlags.Optional), default: null, description: "" });
        continue;
      }
      props.push({
        name: sym.name,
        type: clean(checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, param), param, fmt)),
        required: !(sym.flags & ts.SymbolFlags.Optional),
        default: defaults[sym.name] ?? null,
        description: ts.displayPartsToString(sym.getDocumentationComment(checker)).replace(/\s+/g, " ").trim(),
      });
    }
    if (!props.length && !inherited.size) continue;
    props.sort((a, b) => Number(b.required) - Number(a.required));
    const extendsList = [...inherited].filter((n) => /HTMLAttributes|SVGProps|ComponentPropsWithoutRef/.test(n) || inherited.size <= 2).slice(0, 2);
    comps.push({ name: found.name, props, extends: extendsList });
  }
  if (comps.length) out[slug] = comps;
}

const target = `${root}apps/docs/src/generated/props.json`;
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(out));
console.log(`✓ Props: ${Object.values(out).reduce((a, c) => a + c.length, 0)} components in ${Object.keys(out).length} files → apps/docs/src/generated/props.json`);
