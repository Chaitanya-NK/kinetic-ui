#!/usr/bin/env node
/**
 * Runs the built plugin (figma/code.js) against a strict mock of the Figma plugin API.
 * It can't render anything, but it catches what usually breaks plugins at runtime: calling an
 * API that doesn't exist, text set before its font loads, invalid layout values, wrap or spacing
 * set in the wrong order, inconsistent variant names and component-property references on the
 * wrong node types.
 *
 *   node figma/test/smoke.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "../code.js"), "utf8");

const problems = [];
const fail = (msg) => problems.push(msg);
const loaded = new Set();
const fontKey = (f) => `${f.family}|${f.style}`;
const counts = {};
let idSeq = 0;
let closedWith = null;

const ENUMS = {
  layoutMode: ["NONE", "HORIZONTAL", "VERTICAL", "GRID"],
  primaryAxisSizingMode: ["FIXED", "AUTO"],
  counterAxisSizingMode: ["FIXED", "AUTO"],
  primaryAxisAlignItems: ["MIN", "CENTER", "MAX", "SPACE_BETWEEN"],
  counterAxisAlignItems: ["MIN", "CENTER", "MAX", "BASELINE"],
  layoutWrap: ["NO_WRAP", "WRAP"],
  layoutAlign: ["MIN", "CENTER", "MAX", "STRETCH", "INHERIT"],
  strokeAlign: ["CENTER", "INSIDE", "OUTSIDE"],
  textAutoResize: ["NONE", "WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE"],
  textAlignHorizontal: ["LEFT", "CENTER", "RIGHT", "JUSTIFIED"],
  textCase: ["ORIGINAL", "UPPER", "LOWER", "TITLE", "SMALL_CAPS", "SMALL_CAPS_FORCED"],
};
const BINDABLE = new Set(["height", "width", "characters", "itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "visible", "cornerRadius", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "minWidth", "maxWidth", "minHeight", "maxHeight", "counterAxisSpacing", "strokeWeight", "opacity"]);
const SCOPES = new Set(["ALL_SCOPES", "TEXT_CONTENT", "CORNER_RADIUS", "WIDTH_HEIGHT", "GAP", "ALL_FILLS", "FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR", "STROKE_FLOAT", "EFFECT_FLOAT", "EFFECT_COLOR", "OPACITY", "FONT_FAMILY", "FONT_STYLE", "FONT_WEIGHT", "FONT_SIZE", "LINE_HEIGHT", "LETTER_SPACING", "PARAGRAPH_SPACING", "PARAGRAPH_INDENT"]);

function checkPaints(where, paints) {
  if (!Array.isArray(paints)) return fail(`${where}: paints must be an array`);
  for (const p of paints) {
    if (p.type !== "SOLID") continue;
    const c = p.color;
    if (!c || [c.r, c.g, c.b].some((v) => typeof v !== "number" || v < 0 || v > 1 || Number.isNaN(v))) fail(`${where}: bad colour ${JSON.stringify(c)}`);
    if ("a" in c) fail(`${where}: SolidPaint.color must be RGB (no alpha); use opacity`);
  }
}

class Node {
  constructor(type) {
    this.id = `${++idSeq}:1`;
    this.type = type;
    this.name = type;
    // Only containers have a children property, as in Figma ("children" in node is how plugins test for it).
    if (["PAGE", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "GROUP", "DOCUMENT"].includes(type)) this.children = [];
    this.parent = null;
    this.width = 100;
    this.height = 100;
    this._fills = [];
    this.layoutMode = "NONE";
    this.layoutWrap = "NO_WRAP";
    counts[type] = (counts[type] ?? 0) + 1;
    return new Proxy(this, {
      set(t, k, v) {
        if (k in ENUMS && !ENUMS[k].includes(v)) fail(`${t.type} "${t.name}": ${String(k)} = ${v} is not valid`);
        if (k === "layoutWrap" && v === "WRAP" && t.layoutMode !== "HORIZONTAL") fail(`${t.name}: layoutWrap WRAP needs layoutMode HORIZONTAL first`);
        if (k === "counterAxisSpacing" && t.layoutWrap !== "WRAP") fail(`${t.name}: counterAxisSpacing needs layoutWrap WRAP first`);
        if (k === "layoutAlign" && (!t.parent || t.parent.layoutMode === "NONE" || !t.parent.layoutMode)) fail(`${t.name}: layoutAlign set while not inside an auto-layout frame`);
        if (["paddingTop", "paddingLeft", "paddingRight", "paddingBottom", "itemSpacing"].includes(k) && (typeof v !== "number" || Number.isNaN(v))) fail(`${t.name}: ${String(k)} = ${v}`);
        if (k === "characters") {
          if (t.type !== "TEXT") fail(`characters on ${t.type}`);
          if (!t.fontName || !loaded.has(fontKey(t.fontName))) fail(`text "${v}": font ${t.fontName && fontKey(t.fontName)} not loaded before setting characters`);
          t.width = Math.max(1, String(v).length * 7);
          t.height = 18;
        }
        if (k === "fills" || k === "strokes") checkPaints(`${t.type} "${t.name}" ${String(k)}`, v);
        if (k === "componentPropertyReferences") {
          for (const key of Object.keys(v ?? {})) {
            if (key === "characters" && t.type !== "TEXT") fail(`componentPropertyReferences.characters on ${t.type}`);
            if (key === "mainComponent" && t.type !== "INSTANCE") fail(`componentPropertyReferences.mainComponent on ${t.type}`);
            if (!["characters", "visible", "mainComponent"].includes(key)) fail(`unknown componentPropertyReferences key ${key}`);
            if (!String(v[key]).includes("#")) fail(`componentPropertyReferences.${key} should be a property key from addComponentProperty, got ${v[key]}`);
          }
        }
        if (k === "constraints" && !(v && ["MIN", "CENTER", "MAX", "STRETCH", "SCALE"].includes(v.horizontal) && ["MIN", "CENTER", "MAX", "STRETCH", "SCALE"].includes(v.vertical))) fail(`bad constraints ${JSON.stringify(v)}`);
        t[k] = v;
        return true;
      },
    });
  }
  appendChild(child) {
    if (!this.children) return fail(`appendChild on ${this.type}`);
    if (child.type === "PAGE" && this.type !== "DOCUMENT") return fail("pages can only go in the document");
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = this;
    this.children.push(child);
  }
  remove() {
    if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
    this.removed = true;
  }
  resize(w, h) {
    if (!(w >= 0.01 && h >= 0.01)) fail(`${this.name}: resize(${w}, ${h}) must be at least 0.01`);
    this.width = w;
    this.height = h;
  }
  setBoundVariable(field, variable) {
    if (!BINDABLE.has(field)) fail(`setBoundVariable: ${field} can't be bound`);
    if (variable && variable.__type !== "VARIABLE") fail("setBoundVariable needs a Variable object");
  }
  async setTextStyleIdAsync(id) {
    const s = styles.get(id);
    if (!s) return fail(`unknown text style ${id}`);
    this.fontName = s.fontName;
  }
  async setEffectStyleIdAsync(id) {
    if (!styles.get(id)) fail(`unknown effect style ${id}`);
  }
  setExplicitVariableModeForCollection(collection, modeId) {
    if (!collection?.modes?.some((m) => m.modeId === modeId)) fail("setExplicitVariableModeForCollection: mode not in collection");
  }
  createInstance() {
    if (this.type !== "COMPONENT") fail(`createInstance on ${this.type}`);
    const i = new Node("INSTANCE");
    i.name = this.name;
    i.mainComponent = this;
    for (const c of this.children) {
      const copy = new Node(c.type);
      copy.name = c.name;
      i.appendChild(copy);
    }
    figma.currentPage.appendChild(i);
    return i;
  }
  addComponentProperty(name, type, value) {
    if (this.type !== "COMPONENT_SET" && this.type !== "COMPONENT") fail(`addComponentProperty on ${this.type}`);
    if (!["TEXT", "BOOLEAN", "INSTANCE_SWAP", "VARIANT", "SLOT"].includes(type)) fail(`bad property type ${type}`);
    if (type === "INSTANCE_SWAP" && !String(value).includes(":")) fail("INSTANCE_SWAP default must be a component id");
    return `${name}#${idSeq}:0`;
  }
  async loadAsync() {}
}

const styles = new Map();
const collections = [];

const figma = {
  root: null,
  currentPage: null,
  mixed: Symbol("mixed"),
  async loadFontAsync(f) {
    // Pretend every font exists except one, so the fallback path runs too.
    if (f.family === "JetBrains Mono") throw new Error("font not available");
    loaded.add(fontKey(f));
  },
  notify() {},
  closePlugin(msg) {
    closedWith = msg ?? "";
  },
  async setCurrentPageAsync(p) {
    if (p.type !== "PAGE") fail("setCurrentPageAsync needs a page");
    figma.currentPage = p;
  },
  createPage() {
    const p = new Node("PAGE");
    figma.root.appendChild(p);
    return p;
  },
  createFrame() { const n = new Node("FRAME"); figma.currentPage.appendChild(n); return n; },
  createComponent() { const n = new Node("COMPONENT"); figma.currentPage.appendChild(n); return n; },
  createRectangle() { const n = new Node("RECTANGLE"); figma.currentPage.appendChild(n); return n; },
  createEllipse() { const n = new Node("ELLIPSE"); figma.currentPage.appendChild(n); return n; },
  createText() {
    const n = new Node("TEXT");
    n.fontName = { family: "Inter", style: "Regular" };
    figma.currentPage.appendChild(n);
    return n;
  },
  createNodeFromSvg(svg) {
    if (!/^<svg[\s\S]*<\/svg>$/.test(svg) || !/ d="[^"]+"/.test(svg)) fail("createNodeFromSvg: malformed svg");
    const f = new Node("FRAME");
    const v = new Node("VECTOR");
    f.appendChild(v);
    figma.currentPage.appendChild(f);
    return f;
  },
  combineAsVariants(nodes, parent) {
    if (!nodes.length) fail("combineAsVariants with no nodes");
    const keys = nodes.map((n) => {
      if (n.type !== "COMPONENT") fail(`combineAsVariants: ${n.type} is not a component`);
      const pairs = n.name.split(",").map((p) => p.trim().split("="));
      if (pairs.some((p) => p.length !== 2 || !p[0] || !p[1])) fail(`variant name "${n.name}" must be "Prop=Value, Prop=Value"`);
      return pairs.map((p) => p[0]).sort().join("|");
    });
    if (new Set(keys).size > 1) fail(`variants mix property sets: ${[...new Set(keys)].join(" vs ")}`);
    const names = nodes.map((n) => n.name.split(",").map((s) => s.trim()).sort().join(","));
    if (new Set(names).size !== names.length) fail(`duplicate variant names in ${names.join(" / ")}`);
    const set = new Node("COMPONENT_SET");
    parent.appendChild(set);
    for (const n of nodes) set.appendChild(n);
    return set;
  },
  createTextStyle() {
    const s = { id: `S:${++idSeq}`, type: "TEXT" };
    styles.set(s.id, s);
    return new Proxy(s, {
      set(t, k, v) {
        if (k === "fontName" && !loaded.has(fontKey(v))) fail(`text style font ${fontKey(v)} not loaded`);
        if (k === "lineHeight" && !["PERCENT", "PIXELS", "AUTO"].includes(v.unit)) fail("bad lineHeight");
        t[k] = v;
        return true;
      },
    });
  },
  createEffectStyle() {
    const s = { id: `S:${++idSeq}`, type: "EFFECT" };
    styles.set(s.id, s);
    return s;
  },
  variables: {
    async getLocalVariableCollectionsAsync() { return collections; },
    createVariableCollection(name) {
      const c = { name, id: `VC:${++idSeq}`, modes: [{ modeId: `M:${++idSeq}`, name: "Mode 1" }] };
      c.renameMode = (id, n) => { const m = c.modes.find((x) => x.modeId === id); if (!m) fail("renameMode: no such mode"); else m.name = n; };
      c.addMode = (n) => { const id = `M:${++idSeq}`; c.modes.push({ modeId: id, name: n }); return id; };
      collections.push(c);
      return c;
    },
    createVariable(name, collection, type) {
      if (typeof collection !== "object") fail("createVariable: pass the collection object (dynamic-page)");
      if (!["COLOR", "FLOAT", "STRING", "BOOLEAN"].includes(type)) fail(`bad variable type ${type}`);
      const v = { __type: "VARIABLE", name, id: `V:${++idSeq}`, resolvedType: type, values: {} };
      v.setValueForMode = (mode, value) => {
        if (!collection.modes.some((m) => m.modeId === mode)) fail(`${name}: unknown mode`);
        if (type === "COLOR" && [value.r, value.g, value.b, value.a ?? 1].some((x) => typeof x !== "number" || x < 0 || x > 1 || Number.isNaN(x))) fail(`${name}: bad colour ${JSON.stringify(value)}`);
        if (type === "FLOAT" && typeof value !== "number") fail(`${name}: bad float`);
        v.values[mode] = value;
      };
      return new Proxy(v, {
        set(t, k, val) {
          if (k === "scopes") {
            for (const s of val) if (!SCOPES.has(s)) fail(`${name}: bad scope ${s}`);
            if (val.includes("ALL_FILLS") && val.some((s) => ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL"].includes(s))) fail(`${name}: ALL_FILLS can't be combined with other fill scopes`);
          }
          t[k] = val;
          return true;
        },
      });
    },
    setBoundVariableForPaint(paint, field, variable) {
      if (field !== "color") fail(`bound paint field ${field}`);
      if (!variable || variable.__type !== "VARIABLE") fail("setBoundVariableForPaint needs a variable");
      return { ...paint, boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } } };
    },
  },
};
figma.root = new Node("DOCUMENT");
const first = new Node("PAGE");
first.name = "Page 1";
figma.root.appendChild(first);
figma.currentPage = first;

const started = Date.now();
vm.runInNewContext(code, { figma, console, setTimeout, Promise });
for (let i = 0; i < 400 && closedWith === null; i++) await new Promise((r) => setTimeout(r, 25));

const pages = figma.root.children.map((p) => `${p.name} (${p.children.length})`);
console.log(`closePlugin: ${closedWith}`);
console.log(`pages: ${pages.join(", ")}`);
console.log(`created: ${Object.entries(counts).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(", ")}; ${collections.length} variable collections, ${styles.size} styles in ${Date.now() - started}ms`);
if (closedWith === null) problems.push("plugin never called closePlugin");
if (closedWith && /failed/i.test(closedWith)) problems.push(`plugin reported failure: ${closedWith}`);
if (problems.length) {
  console.error(`\n✕ ${problems.length} problem(s):\n  ${[...new Set(problems)].slice(0, 40).join("\n  ")}`);
  process.exitCode = 1;
} else console.log("\n✓ No problems found");
