/**
 * Kinetic UI kit generator for Figma.
 *
 * Creates, in the current file:
 *   - Variables: "Kinetic UI" colours with Dark and Light modes, and "Kinetic UI / Size" radii.
 *   - Text styles (Space Grotesk, Inter, JetBrains Mono) and a shadow style.
 *   - Pages: Cover, Foundations, Icons (every icon as a component) and Components
 *     (variant sets bound to the variables, so switching a frame to Light re-themes everything).
 */
import { icons, tokens, version } from "./data.generated";

type TokenName = keyof typeof tokens.dark;
const KIT = "Kinetic UI";

/* ------------------------------------------------------------------ colour helpers */

function parseColor(value: string): RGBA {
  const v = value.trim();
  if (v.startsWith("#")) {
    const h = v.length === 4 ? v.slice(1).split("").map((c) => c + c).join("") : v.slice(1);
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a };
  }
  const m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/.exec(v);
  if (m) {
    const alpha = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1]! / 255, g: +m[2]! / 255, b: +m[3]! / 255, a: alpha };
  }
  // Anything we can't read (e.g. color-mix) falls back to transparent rather than failing the run.
  return { r: 0, g: 0, b: 0, a: 0 };
}

const group = (name: string) =>
  /^code-/.test(name) ? `code/${name.replace(/^code-/, "")}`
  : /^(background|surface)/.test(name) ? `surface/${name}`
  : /^(foreground|muted|subtle)$/.test(name) ? `text/${name}`
  : /^border/.test(name) ? `border/${name}`
  : /^(accent|ring)/.test(name) ? `brand/${name}`
  : /^(success|warning|danger|info)/.test(name) ? `status/${name}`
  : /^shadow/.test(name) ? `effect/${name}`
  : `other/${name}`;

/* ------------------------------------------------------------------ setup */

const V: Record<string, Variable> = {};
const R: Record<string, Variable> = {};
const TS: Record<string, TextStyle> = {};
let shadowStyle: EffectStyle;
let colorCollection: VariableCollection;
let lightMode = "";
const iconComponents: Record<string, ComponentNode> = {};

const FONTS = {
  display: { family: "Space Grotesk", fallback: "Inter" },
  body: { family: "Inter", fallback: "Inter" },
  mono: { family: "JetBrains Mono", fallback: "Roboto Mono" },
} as const;
const resolved: Record<string, string> = {};

async function loadFonts() {
  const want: [keyof typeof FONTS, string[]][] = [
    ["display", ["Medium", "SemiBold", "Bold"]],
    ["body", ["Regular", "Medium", "SemiBold", "Bold"]],
    ["mono", ["Regular", "Medium"]],
  ];
  for (const [role, styles] of want) {
    const { family, fallback } = FONTS[role];
    let use: string = family;
    for (const style of styles) {
      try {
        await figma.loadFontAsync({ family: use, style: styleName(use, style) });
      } catch {
        use = fallback;
        try {
          await figma.loadFontAsync({ family: use, style: styleName(use, style) });
        } catch {
          use = "Inter";
          await figma.loadFontAsync({ family: "Inter", style: styleName("Inter", style) });
        }
      }
    }
    resolved[role] = use;
  }
}
/** Google fonts in Figma spell the weight "Semi Bold"; most others use "SemiBold". */
const styleName = (family: string, style: string) => (style === "SemiBold" && (family === "Inter" || family === "Space Grotesk" || family === "JetBrains Mono") ? "Semi Bold" : style);
const font = (role: keyof typeof FONTS, style: string): FontName => ({ family: resolved[role] ?? "Inter", style: styleName(resolved[role] ?? "Inter", style) });

function createVariables() {
  colorCollection = figma.variables.createVariableCollection(KIT);
  const darkMode = colorCollection.modes[0]!.modeId;
  colorCollection.renameMode(darkMode, "Dark");
  lightMode = colorCollection.addMode("Light");
  for (const name of Object.keys(tokens.dark) as TokenName[]) {
    if (name === "shadow") continue;
    const dv = parseColor(tokens.dark[name]);
    const lv = parseColor((tokens.light as Record<string, string>)[name] ?? tokens.dark[name]);
    const v = figma.variables.createVariable(group(name), colorCollection, "COLOR");
    v.setValueForMode(darkMode, dv);
    v.setValueForMode(lightMode, lv);
    v.scopes = name.includes("border") || name === "ring" ? ["STROKE_COLOR", "EFFECT_COLOR", "FRAME_FILL", "SHAPE_FILL"] : ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"];
    v.description = `--kn-${name}`;
    V[name] = v;
  }

  const sizes = figma.variables.createVariableCollection(`${KIT} / Size`);
  sizes.renameMode(sizes.modes[0]!.modeId, "Default");
  const radii: [string, number][] = [["radius/sm", 8], ["radius/md", 12], ["radius/lg", 16], ["radius/xl", 20], ["radius/2xl", 24], ["radius/full", 999]];
  for (const [n, value] of radii) {
    const v = figma.variables.createVariable(n, sizes, "FLOAT");
    v.setValueForMode(sizes.modes[0]!.modeId, value);
    v.scopes = ["CORNER_RADIUS"];
    R[n.split("/")[1]!] = v;
  }
  const space: [string, number][] = [["space/1", 4], ["space/2", 8], ["space/3", 12], ["space/4", 16], ["space/5", 20], ["space/6", 24], ["space/8", 32], ["space/10", 40], ["space/12", 48]];
  for (const [n, value] of space) {
    const v = figma.variables.createVariable(n, sizes, "FLOAT");
    v.setValueForMode(sizes.modes[0]!.modeId, value);
    v.scopes = ["GAP", "WIDTH_HEIGHT"];
  }
}

function createStyles() {
  const defs: [string, keyof typeof FONTS, string, number, number, number][] = [
    // name, font, weight, size, line height (%), letter spacing (%)
    ["Display/XL", "display", "SemiBold", 72, 102, -3],
    ["Display/L", "display", "SemiBold", 56, 104, -2.5],
    ["Display/M", "display", "SemiBold", 40, 110, -2],
    ["Heading/L", "display", "SemiBold", 30, 120, -1.5],
    ["Heading/M", "display", "SemiBold", 24, 125, -1],
    ["Heading/S", "display", "SemiBold", 18, 130, -0.5],
    ["Body/L", "body", "Regular", 18, 160, 0],
    ["Body/M", "body", "Regular", 15, 160, 0],
    ["Body/S", "body", "Regular", 13, 150, 0],
    ["Label/M", "body", "Medium", 14, 140, 0],
    ["Label/S", "body", "Medium", 12, 140, 0],
    ["Mono/M", "mono", "Regular", 13, 160, 0],
    ["Mono/Eyebrow", "mono", "Medium", 11, 140, 18],
  ];
  for (const [name, role, weight, size, lh, ls] of defs) {
    const s = figma.createTextStyle();
    s.name = `${KIT}/${name}`;
    s.fontName = font(role, weight);
    s.fontSize = size;
    s.lineHeight = { unit: "PERCENT", value: lh };
    s.letterSpacing = { unit: "PERCENT", value: ls };
    if (name === "Mono/Eyebrow") s.textCase = "UPPER";
    TS[name] = s;
  }
  shadowStyle = figma.createEffectStyle();
  shadowStyle.name = `${KIT}/Shadow/Overlay`;
  shadowStyle.effects = [
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.45 }, offset: { x: 0, y: 24 }, radius: 48, spread: -12, visible: true, blendMode: "NORMAL" },
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: "NORMAL" },
  ];
}

/* ------------------------------------------------------------------ node helpers */

const solid = (name: TokenName): SolidPaint => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", V[name]!);

function paint(node: GeometryMixin, name: TokenName | null) {
  node.fills = name ? [solid(name)] : [];
}
function outline(node: GeometryMixin & MinimalStrokesMixin, name: TokenName, weight = 1) {
  node.strokes = [solid(name)];
  node.strokeWeight = weight;
  node.strokeAlign = "INSIDE";
}
function radius(node: FrameNode | ComponentNode | RectangleNode, r: keyof typeof R) {
  for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) node.setBoundVariable(corner, R[r]!);
}

type LayoutOpts = {
  dir?: "HORIZONTAL" | "VERTICAL";
  gap?: number;
  pad?: number | [number, number] | [number, number, number, number];
  align?: "MIN" | "CENTER" | "MAX";
  justify?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  fill?: TokenName | null;
  stroke?: TokenName;
  r?: keyof typeof R;
  width?: number;
  height?: number;
};

function layout<T extends FrameNode | ComponentNode>(node: T, o: LayoutOpts = {}): T {
  node.layoutMode = o.dir ?? "HORIZONTAL";
  node.itemSpacing = o.gap ?? 0;
  const p = o.pad ?? 0;
  const [t, rr, b, l] = typeof p === "number" ? [p, p, p, p] : p.length === 2 ? [p[0], p[1], p[0], p[1]] : p;
  node.paddingTop = t;
  node.paddingRight = rr;
  node.paddingBottom = b;
  node.paddingLeft = l;
  node.counterAxisAlignItems = o.align ?? "CENTER";
  node.primaryAxisAlignItems = o.justify ?? "MIN";
  node.primaryAxisSizingMode = "AUTO";
  node.counterAxisSizingMode = "AUTO";
  paint(node, o.fill === undefined ? null : o.fill);
  if (o.stroke) outline(node, o.stroke);
  if (o.r) radius(node, o.r);
  if (o.width !== undefined) {
    if (node.layoutMode === "HORIZONTAL") node.primaryAxisSizingMode = "FIXED";
    else node.counterAxisSizingMode = "FIXED";
    node.resize(o.width, Math.max(1, node.height));
  }
  if (o.height !== undefined) {
    if (node.layoutMode === "VERTICAL") node.primaryAxisSizingMode = "FIXED";
    else node.counterAxisSizingMode = "FIXED";
    node.resize(Math.max(1, node.width), o.height);
  }
  return node;
}

function frame(name: string, o: LayoutOpts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.clipsContent = false;
  return layout(f, o);
}

async function text(chars: string, style: keyof typeof TS, color: TokenName = "foreground", name?: string) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style]!.id);
  t.characters = chars;
  t.fills = [solid(color)];
  t.name = name ?? chars.slice(0, 32);
  return t;
}

function icon(name: string, size: number, color: TokenName = "foreground"): InstanceNode | FrameNode {
  const c = iconComponents[name];
  const node = c ? c.createInstance() : (figma.createNodeFromSvg(svgFor(name, size)) as FrameNode);
  node.resize(size, size);
  tint(node, color);
  return node;
}

/** Recolour every vector stroke inside an icon (instances keep the override). */
function tint(node: SceneNode, color: TokenName) {
  if ("strokes" in node && node.type === "VECTOR") node.strokes = [solid(color)];
  if ("children" in node) for (const c of node.children) tint(c, color);
}

const svgFor = (name: string, size = 24) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name] ?? icons.circle ?? "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"}"/></svg>`;

function append(parent: BaseNode & ChildrenMixin, ...nodes: SceneNode[]) {
  for (const n of nodes) parent.appendChild(n);
}

/** Lay out the variants of a set in a wrapping grid. */
function arrangeSet(set: ComponentSetNode, width: number, gap = 16) {
  set.layoutMode = "HORIZONTAL";
  set.layoutWrap = "WRAP";
  set.itemSpacing = gap;
  set.counterAxisSpacing = gap;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 24;
  set.primaryAxisSizingMode = "FIXED";
  set.counterAxisSizingMode = "AUTO";
  set.counterAxisAlignItems = "MIN";
  set.resize(width, set.height);
  set.fills = [solid("surface")];
  set.strokes = [solid("border")];
  set.dashPattern = [6, 4];
  set.cornerRadius = 20;
}

function combine(components: ComponentNode[], parent: BaseNode & ChildrenMixin, name: string, width = 1040) {
  const set = figma.combineAsVariants(components, parent);
  set.name = name;
  arrangeSet(set, width);
  return set;
}

/** A labelled section on a page: title, description, then the content. */
async function section(page: FrameNode, title: string, description: string) {
  const s = frame(title, { dir: "VERTICAL", gap: 16, align: "MIN" });
  append(s, await text(title, "Heading/M"), await text(description, "Body/S", "muted"));
  page.appendChild(s);
  return s;
}

/* ------------------------------------------------------------------ pages */

async function makePage(name: string) {
  const page = figma.createPage();
  page.name = name;
  await figma.setCurrentPageAsync(page);
  const board = frame(`${name} board`, { dir: "VERTICAL", gap: 64, pad: 80, align: "MIN", fill: "background", width: 1200 });
  board.primaryAxisSizingMode = "AUTO";
  page.appendChild(board);
  return { page, board };
}

async function coverPage() {
  const { board } = await makePage("Cover");
  board.name = "Cover";
  board.primaryAxisSizingMode = "FIXED";
  board.counterAxisSizingMode = "FIXED";
  board.resize(1600, 960);
  board.primaryAxisAlignItems = "CENTER";
  board.itemSpacing = 28;
  const logo = frame("Logo", { gap: 16 });
  const mark = frame("Mark", { pad: 14, fill: "accent", r: "lg", justify: "CENTER" });
  mark.appendChild(icon("sparkle", 36, "accent-foreground"));
  append(logo, mark, await text("Kinetic UI", "Heading/L"));
  const title = await text("Components\nthat move.", "Display/XL");
  const sub = await text(`The Figma kit for Kinetic UI v${version}: tokens, type, icons and components that match the React library one to one.`, "Body/L", "muted");
  sub.resize(720, sub.height);
  sub.textAutoResize = "HEIGHT";
  const swatches = frame("Swatches", { gap: 12 });
  for (const n of ["accent", "foreground", "surface-raised", "success", "info", "warning", "danger"] as TokenName[]) {
    const sw = figma.createEllipse();
    sw.resize(40, 40);
    sw.fills = [solid(n)];
    sw.strokes = [solid("border-strong")];
    sw.name = n;
    swatches.appendChild(sw);
  }
  append(board, logo, title, sub, swatches, await text("kinetic-ui.chaitanya-nk.com", "Mono/Eyebrow", "accent"));
}

async function foundationsPage() {
  const { board } = await makePage("Foundations");

  // Colours, shown in both modes side by side.
  const colors = await section(board, "Colour", "Every token is a variable in the Kinetic UI collection with Dark and Light modes. Set a frame's mode to switch themes.");
  const modes = frame("Modes", { gap: 24, align: "MIN" });
  for (const mode of ["Dark", "Light"]) {
    const panel = frame(`${mode} mode`, { dir: "VERTICAL", gap: 16, pad: 24, fill: "background", stroke: "border", r: "xl", align: "MIN" });
    if (mode === "Light") panel.setExplicitVariableModeForCollection(colorCollection, lightMode);
    panel.appendChild(await text(mode, "Mono/Eyebrow", "subtle"));
    const grid = frame("Grid", { gap: 12, align: "MIN", width: 492 });
    grid.layoutWrap = "WRAP";
    grid.counterAxisSpacing = 12;
    for (const name of Object.keys(V) as TokenName[]) {
      if (name.startsWith("code-")) continue;
      const cell = frame(name, { dir: "VERTICAL", gap: 6, align: "MIN" });
      const chip = figma.createRectangle();
      chip.resize(112, 56);
      chip.fills = [solid(name)];
      chip.strokes = [solid("border")];
      chip.cornerRadius = 10;
      append(cell, chip, await text(name, "Label/S", "foreground"), await text(`--kn-${name}`, "Mono/M", "subtle"));
      grid.appendChild(cell);
    }
    panel.appendChild(grid);
    modes.appendChild(panel);
  }
  colors.appendChild(modes);

  // Type scale
  const type = await section(board, "Type", "Space Grotesk for display, Inter for text, JetBrains Mono for code and eyebrows. All are text styles.");
  for (const name of Object.keys(TS)) {
    const row = frame(name, { gap: 24, align: "CENTER" });
    const label = await text(name, "Mono/M", "subtle");
    label.resize(140, label.height);
    label.textAutoResize = "HEIGHT";
    append(row, label, await text(name.startsWith("Mono") ? "npx @kineticui/cli add" : "Interfaces that move", name as keyof typeof TS));
    type.appendChild(row);
  }

  // Radius and elevation
  const shape = await section(board, "Radius and elevation", "Radius variables live in the Kinetic UI / Size collection. Floating layers use the Overlay shadow.");
  const row = frame("Radii", { gap: 20, align: "MAX" });
  for (const r of Object.keys(R)) {
    const cell = frame(r, { dir: "VERTICAL", gap: 8, align: "CENTER" });
    const box = figma.createRectangle();
    box.resize(88, 88);
    box.fills = [solid("surface-raised")];
    box.strokes = [solid("border-strong")];
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) box.setBoundVariable(corner, R[r]!);
    append(cell, box, await text(r, "Mono/M", "subtle"));
    row.appendChild(cell);
  }
  const lifted = frame("Overlay shadow", { pad: [20, 24], fill: "surface-raised", stroke: "border", r: "xl" });
  await lifted.setEffectStyleIdAsync(shadowStyle.id);
  lifted.appendChild(await text("Overlay", "Label/M"));
  row.appendChild(lifted);
  shape.appendChild(row);
}

async function iconsPage() {
  const { page, board } = await makePage("Icons");
  const s = await section(board, "Icons", `${Object.keys(icons).length} icons on a 24px grid with a 2px stroke, matching @kineticui/icons. Each is a component; swap them in any instance.`);
  const grid = frame("Icon grid", { gap: 8, align: "MIN", width: 1040 });
  grid.layoutWrap = "WRAP";
  grid.counterAxisSpacing = 8;
  for (const name of Object.keys(icons).sort()) {
    const cell = frame(name, { dir: "VERTICAL", gap: 6, pad: [12, 4], align: "CENTER", width: 96, fill: "surface", r: "md" });
    const svg = figma.createNodeFromSvg(svgFor(name));
    const c = figma.createComponent();
    c.name = `Icon/${name}`;
    c.resize(24, 24);
    c.fills = [];
    for (const child of [...svg.children]) {
      c.appendChild(child);
      // Scale with the instance, so a 16px icon is the whole glyph shrunk rather than a cropped 24px one.
      if ("constraints" in child) child.constraints = { horizontal: "SCALE", vertical: "SCALE" };
    }
    svg.remove();
    tint(c, "foreground");
    c.description = `${name} from @kineticui/icons`;
    iconComponents[name] = c;
    const label = await text(name, "Label/S", "subtle");
    label.textAutoResize = "WIDTH_AND_HEIGHT";
    append(cell, c, label);
    grid.appendChild(cell);
  }
  s.appendChild(grid);
  void page;
}

/* ------------------------------------------------------------------ components */

const buttonVariants: Record<string, { fill: TokenName | null; text: TokenName; stroke?: TokenName }> = {
  primary: { fill: "accent", text: "accent-foreground" },
  secondary: { fill: "surface-overlay", text: "foreground", stroke: "border" },
  outline: { fill: null, text: "foreground", stroke: "border-strong" },
  ghost: { fill: null, text: "foreground" },
  soft: { fill: "accent-soft", text: "accent-soft-foreground" },
  destructive: { fill: "danger", text: "background" },
};
const buttonSizes = { sm: { h: 32, px: 12, icon: 14 }, md: { h: 40, px: 16, icon: 16 }, lg: { h: 48, px: 20, icon: 18 } };

async function buttons(page: FrameNode) {
  const s = await section(page, "Button", "Variant × Size. Edit the Label property; toggle Icon and swap it from the Icons page.");
  const parts: ComponentNode[] = [];
  const labels: TextNode[] = [];
  const iconNodes: SceneNode[] = [];
  for (const [variant, look] of Object.entries(buttonVariants)) {
    for (const [size, dims] of Object.entries(buttonSizes)) {
      const c = layout(figma.createComponent(), { gap: 8, pad: [0, dims.px], fill: look.fill, stroke: look.stroke, r: "md", justify: "CENTER", height: dims.h });
      c.name = `Variant=${variant}, Size=${size}`;
      const label = await text("Button", size === "sm" ? "Label/S" : "Label/M", look.text, "Label");
      const ic = icon("arrow-right", dims.icon, look.text);
      ic.name = "Icon";
      append(c, label, ic);
      labels.push(label);
      iconNodes.push(ic);
      parts.push(c);
    }
  }
  const set = combine(parts, s, "Button");
  const labelProp = set.addComponentProperty("Label", "TEXT", "Button");
  const iconProp = set.addComponentProperty("Icon", "BOOLEAN", true);
  const swap = iconComponents["arrow-right"] ? set.addComponentProperty("Icon glyph", "INSTANCE_SWAP", iconComponents["arrow-right"].id) : null;
  for (const l of labels) l.componentPropertyReferences = { characters: labelProp };
  for (const i of iconNodes) i.componentPropertyReferences = swap && i.type === "INSTANCE" ? { visible: iconProp, mainComponent: swap } : { visible: iconProp };
}

const badgeLooks: Record<string, { fill: TokenName | null; text: TokenName; stroke?: TokenName; dot: TokenName }> = {
  soft: { fill: "accent-soft", text: "accent-soft-foreground", dot: "accent" },
  solid: { fill: "accent", text: "accent-foreground", dot: "accent-foreground" },
  outline: { fill: null, text: "foreground", stroke: "border-strong", dot: "accent" },
  neutral: { fill: "surface-overlay", text: "muted", dot: "subtle" },
  success: { fill: "success-soft", text: "success", dot: "success" },
  warning: { fill: "warning-soft", text: "warning", dot: "warning" },
  danger: { fill: "danger-soft", text: "danger", dot: "danger" },
  info: { fill: "info-soft", text: "info", dot: "info" },
};

async function badges(page: FrameNode) {
  const s = await section(page, "Badge", "Eight tones, with an optional status dot.");
  const parts: ComponentNode[] = [];
  const labels: TextNode[] = [];
  const dots: SceneNode[] = [];
  for (const [variant, look] of Object.entries(badgeLooks)) {
    const c = layout(figma.createComponent(), { gap: 6, pad: [4, 10], fill: look.fill, stroke: look.stroke, r: "full" });
    c.name = `Variant=${variant}`;
    const dot = figma.createEllipse();
    dot.resize(6, 6);
    dot.fills = [solid(look.dot)];
    dot.name = "Dot";
    const label = await text(variant[0]!.toUpperCase() + variant.slice(1), "Label/S", look.text, "Label");
    append(c, dot, label);
    parts.push(c);
    labels.push(label);
    dots.push(dot);
  }
  const set = combine(parts, s, "Badge");
  const lp = set.addComponentProperty("Label", "TEXT", "Badge");
  const dp = set.addComponentProperty("Dot", "BOOLEAN", true);
  labels.forEach((l) => (l.componentPropertyReferences = { characters: lp }));
  dots.forEach((d) => (d.componentPropertyReferences = { visible: dp }));
}

async function fields(page: FrameNode) {
  const s = await section(page, "Field and Input", "Label, input and hint. States match the focus ring and error styles in code.");
  const parts: ComponentNode[] = [];
  const states: Record<string, { stroke: TokenName; hint: string; hintColor: TokenName; ring?: boolean; fade?: boolean }> = {
    default: { stroke: "border", hint: "We never share your email.", hintColor: "subtle" },
    focus: { stroke: "accent", hint: "We never share your email.", hintColor: "subtle", ring: true },
    invalid: { stroke: "danger", hint: "Enter a valid email address.", hintColor: "danger" },
    disabled: { stroke: "border", hint: "Locked by your admin.", hintColor: "subtle", fade: true },
  };
  for (const [state, look] of Object.entries(states)) {
    const c = layout(figma.createComponent(), { dir: "VERTICAL", gap: 6, align: "MIN", width: 300 });
    c.name = `State=${state}`;
    const input = frame("Input", { gap: 8, pad: [0, 14], fill: "background", stroke: look.stroke, r: "md", width: 300, height: 44 });
    if (look.ring) input.effects = [{ type: "DROP_SHADOW", color: parseColor(tokens.dark.ring), offset: { x: 0, y: 0 }, radius: 0, spread: 4, visible: true, blendMode: "NORMAL" }];
    append(input, icon("mail", 16, "subtle"), await text(state === "default" ? "you@example.com" : "maya@kinetic.dev", "Body/M", state === "default" ? "subtle" : "foreground", "Value"));
    append(c, await text("Email", "Label/M", "foreground", "Label"), input, await text(look.hint, "Body/S", look.hintColor, "Hint"));
    if (look.fade) c.opacity = 0.5;
    parts.push(c);
  }
  combine(parts, s, "Field");
}

async function toggles(page: FrameNode) {
  const s = await section(page, "Checkbox, Radio and Switch", "Selection controls in every state.");
  const box = (checked: "true" | "false" | "mixed") => {
    const c = layout(figma.createComponent(), { justify: "CENTER", fill: checked === "false" ? "background" : "accent", stroke: checked === "false" ? "border-strong" : undefined, width: 20, height: 20 });
    c.cornerRadius = 6;
    if (checked !== "false") c.appendChild(icon(checked === "true" ? "check" : "minus", 14, "accent-foreground"));
    c.name = `Checked=${checked}`;
    return c;
  };
  combine([box("false"), box("true"), box("mixed")], s, "Checkbox", 400);

  const radio = (on: boolean) => {
    const c = layout(figma.createComponent(), { justify: "CENTER", fill: "background", stroke: on ? "accent" : "border-strong", r: "full", width: 20, height: 20 });
    if (on) {
      const dot = figma.createEllipse();
      dot.resize(10, 10);
      dot.fills = [solid("accent")];
      c.appendChild(dot);
    }
    c.name = `Checked=${on}`;
    return c;
  };
  combine([radio(false), radio(true)], s, "Radio", 400);

  const sw = (on: boolean) => {
    const c = layout(figma.createComponent(), { pad: 2, fill: on ? "accent" : "border-strong", r: "full", width: 44, height: 24, justify: on ? "MAX" : "MIN" });
    const knob = figma.createEllipse();
    knob.resize(20, 20);
    knob.fills = [solid(on ? "accent-foreground" : "foreground")];
    knob.name = "Knob";
    c.appendChild(knob);
    c.name = `On=${on}`;
    return c;
  };
  combine([sw(false), sw(true)], s, "Switch", 400);
}

async function selectAndTabs(page: FrameNode) {
  const s = await section(page, "Select, Tabs and Segmented control", "Navigation and choice controls.");
  const select = layout(figma.createComponent(), { gap: 8, pad: [0, 14], fill: "background", stroke: "border", r: "md", width: 260, height: 44, justify: "SPACE_BETWEEN" });
  select.name = "Select";
  append(select, await text("Next.js", "Body/M", "foreground", "Value"), icon("chevron-down", 16, "subtle"));
  s.appendChild(select);

  const tabs = (variant: "underline" | "pill") => {
    const c = layout(figma.createComponent(), { gap: variant === "pill" ? 4 : 20, pad: variant === "pill" ? 4 : 0, fill: variant === "pill" ? "surface" : null, stroke: variant === "pill" ? "border" : undefined, r: variant === "pill" ? "lg" : undefined, align: "MAX" });
    c.name = `Variant=${variant}`;
    return c;
  };
  const parts: ComponentNode[] = [];
  for (const variant of ["underline", "pill"] as const) {
    const c = tabs(variant);
    for (const [i, label] of ["Overview", "Analytics", "Settings"].entries()) {
      const active = i === 0;
      const tab = frame(label, { dir: "VERTICAL", gap: 8, pad: variant === "pill" ? [8, 14] : [0, 0], fill: variant === "pill" && active ? "surface-overlay" : null, r: variant === "pill" ? "md" : undefined });
      tab.appendChild(await text(label, "Label/M", active ? "foreground" : "muted"));
      if (variant === "underline") {
        const bar = figma.createRectangle();
        bar.resize(40, 2);
        bar.fills = active ? [solid("accent")] : [];
        tab.appendChild(bar);
        bar.layoutAlign = "STRETCH";
      }
      c.appendChild(tab);
    }
    parts.push(c);
  }
  combine(parts, s, "Tabs", 520);

  const seg = layout(figma.createComponent(), { gap: 4, pad: 4, fill: "surface", stroke: "border", r: "lg" });
  seg.name = "Segmented control";
  for (const [i, l] of ["Day", "Week", "Month"].entries()) {
    const opt = frame(l, { pad: [6, 14], fill: i === 1 ? "accent" : null, r: "md" });
    opt.appendChild(await text(l, "Label/S", i === 1 ? "accent-foreground" : "muted"));
    seg.appendChild(opt);
  }
  s.appendChild(seg);
}

async function avatars(page: FrameNode) {
  const s = await section(page, "Avatar", "Initials or a photo fill, with an optional status.");
  const parts: ComponentNode[] = [];
  const sizes = { sm: 28, md: 40, lg: 56 };
  const status: Record<string, TokenName | null> = { none: null, online: "success", away: "warning", busy: "danger" };
  for (const [size, px] of Object.entries(sizes)) {
    for (const [st, color] of Object.entries(status)) {
      const c = figma.createComponent();
      c.name = `Size=${size}, Status=${st}`;
      c.resize(px, px);
      c.fills = [];
      const circle = figma.createEllipse();
      circle.resize(px, px);
      circle.fills = [solid("info")];
      circle.name = "Photo";
      const initials = await text("MK", px < 40 ? "Label/S" : "Label/M", "background", "Initials");
      initials.textAlignHorizontal = "CENTER";
      initials.x = (px - initials.width) / 2;
      initials.y = (px - initials.height) / 2;
      append(c, circle, initials);
      if (color) {
        const dot = figma.createEllipse();
        const d = Math.round(px * 0.28);
        dot.resize(d, d);
        dot.x = px - d;
        dot.y = px - d;
        dot.fills = [solid(color)];
        dot.strokes = [solid("background")];
        dot.strokeWeight = 2;
        dot.name = "Status";
        c.appendChild(dot);
      }
      parts.push(c);
    }
  }
  combine(parts, s, "Avatar", 640);
}

async function feedback(page: FrameNode) {
  const s = await section(page, "Alert, Toast, Tooltip and Progress", "Feedback in every tone.");
  const tones: Record<string, { soft: TokenName; strong: TokenName; icon: string; title: string }> = {
    info: { soft: "info-soft", strong: "info", icon: "info", title: "Heads up" },
    success: { soft: "success-soft", strong: "success", icon: "check", title: "Deployed" },
    warning: { soft: "warning-soft", strong: "warning", icon: "alert-triangle", title: "Usage at 80%" },
    danger: { soft: "danger-soft", strong: "danger", icon: "x", title: "Payment failed" },
  };
  const alerts: ComponentNode[] = [];
  for (const [tone, t] of Object.entries(tones)) {
    const c = layout(figma.createComponent(), { gap: 12, pad: [14, 16], fill: t.soft, r: "lg", align: "MIN", width: 420 });
    c.name = `Tone=${tone}`;
    const body = frame("Body", { dir: "VERTICAL", gap: 2, align: "MIN" });
    append(body, await text(t.title, "Label/M", "foreground", "Title"), await text("A short line that explains what happened.", "Body/S", "muted", "Description"));
    append(c, icon(icons[t.icon] ? t.icon : "info", 18, t.strong), body);
    alerts.push(c);
  }
  combine(alerts, s, "Alert", 920);

  const toast = layout(figma.createComponent(), { gap: 12, pad: [12, 14], fill: "surface-raised", stroke: "border", r: "lg", width: 340 });
  toast.name = "Toast";
  await toast.setEffectStyleIdAsync(shadowStyle.id);
  const tb = frame("Body", { dir: "VERTICAL", gap: 2, align: "MIN" });
  append(tb, await text("Saved", "Label/M", "foreground", "Title"), await text("Your changes are live.", "Body/S", "muted", "Description"));
  const check = frame("Icon", { pad: 4, fill: "success-soft", r: "full" });
  check.appendChild(icon("check", 14, "success"));
  append(toast, check, tb);

  const tooltip = layout(figma.createComponent(), { gap: 8, pad: [6, 10], fill: "foreground", r: "md" });
  tooltip.name = "Tooltip";
  const kbd = frame("Shortcut", { pad: [1, 5], stroke: "muted", r: "sm" });
  kbd.appendChild(await text("⌘K", "Mono/M", "background"));
  append(tooltip, await text("Search", "Label/S", "background", "Label"), kbd);

  const progress = layout(figma.createComponent(), { dir: "VERTICAL", gap: 8, align: "MIN", width: 320 });
  progress.name = "Progress";
  const head = frame("Head", { justify: "SPACE_BETWEEN", width: 320 });
  append(head, await text("Uploading", "Body/S", "muted"), await text("60%", "Mono/M", "accent"));
  const track = frame("Track", { fill: "border", r: "full", width: 320, height: 8, align: "MIN" });
  const bar = figma.createRectangle();
  bar.resize(192, 8);
  bar.fills = [solid("accent")];
  bar.cornerRadius = 999;
  bar.name = "Value";
  track.appendChild(bar);
  append(progress, head, track);

  const kbdc = layout(figma.createComponent(), { pad: [2, 6], fill: "surface-overlay", stroke: "border", r: "sm" });
  kbdc.name = "Kbd";
  kbdc.appendChild(await text("⌘K", "Mono/M", "muted", "Keys"));

  const row = frame("Misc", { gap: 24, align: "CENTER" });
  append(row, toast, tooltip, progress, kbdc);
  s.appendChild(row);
}

async function surfaces(page: FrameNode) {
  const s = await section(page, "Card and Dialog", "Surfaces and overlays.");
  const card = layout(figma.createComponent(), { dir: "VERTICAL", gap: 12, pad: 24, fill: "surface", stroke: "border", r: "xl", align: "MIN", width: 340 });
  card.name = "Card";
  const badge = frame("Badge", { pad: [4, 10], fill: "accent-soft", r: "full" });
  badge.appendChild(await text("New", "Label/S", "accent-soft-foreground"));
  append(card, badge, await text("Invite your team", "Heading/S", "foreground", "Title"), await text("They get access as soon as they accept.", "Body/S", "muted", "Description"));

  const dialog = layout(figma.createComponent(), { dir: "VERTICAL", gap: 20, pad: 24, fill: "surface-raised", stroke: "border", r: "2xl", align: "MIN", width: 440 });
  dialog.name = "Dialog";
  await dialog.setEffectStyleIdAsync(shadowStyle.id);
  const head = frame("Header", { justify: "SPACE_BETWEEN", width: 392, align: "MIN" });
  const titles = frame("Titles", { dir: "VERTICAL", gap: 4, align: "MIN" });
  append(titles, await text("Delete project?", "Heading/S", "foreground", "Title"), await text("This removes 24 files for everyone.", "Body/S", "muted", "Description"));
  append(head, titles, icon("x", 18, "subtle"));
  const actions = frame("Actions", { gap: 8, justify: "MAX", width: 392 });
  const cancel = frame("Cancel", { pad: [0, 16], fill: "surface-overlay", stroke: "border", r: "md", height: 40 });
  cancel.appendChild(await text("Cancel", "Label/M"));
  const del = frame("Delete", { pad: [0, 16], fill: "danger", r: "md", height: 40 });
  del.appendChild(await text("Delete", "Label/M", "background"));
  append(actions, cancel, del);
  append(dialog, head, actions);

  const row = frame("Surfaces", { gap: 24, align: "MIN" });
  append(row, card, dialog);
  s.appendChild(row);
}

async function island(page: FrameNode) {
  const s = await section(page, "Dynamic Island", "The signature live-activity pill, compact and expanded.");
  const compact = layout(figma.createComponent(), { gap: 10, pad: [8, 12], r: "full", width: 236, justify: "SPACE_BETWEEN" });
  compact.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  compact.name = "State=compact";
  const art = figma.createRectangle();
  art.resize(22, 22);
  art.cornerRadius = 6;
  art.fills = [solid("accent")];
  const bars = frame("Bars", { gap: 2, align: "MAX" });
  for (const h of [8, 14, 10, 16]) {
    const b = figma.createRectangle();
    b.resize(3, h);
    b.cornerRadius = 2;
    b.fills = [solid("accent")];
    bars.appendChild(b);
  }
  append(compact, art, bars);

  const open = layout(figma.createComponent(), { dir: "VERTICAL", gap: 14, pad: 18, r: "2xl", width: 360, align: "MIN" });
  open.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  open.name = "State=expanded";
  const top = frame("Track", { gap: 12 });
  const cover = figma.createRectangle();
  cover.resize(48, 48);
  cover.cornerRadius = 12;
  cover.fills = [solid("accent")];
  const meta = frame("Meta", { dir: "VERTICAL", gap: 2, align: "MIN" });
  const t1 = await text("Midnight Drive", "Label/M", "foreground", "Title");
  t1.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  const t2 = await text("Neon Coast", "Body/S", "subtle", "Artist");
  append(meta, t1, t2);
  append(top, cover, meta);
  const controls = frame("Controls", { gap: 28, justify: "CENTER", width: 324 });
  for (const n of ["skip-back", "pause", "skip-forward"]) {
    const ic = icon(icons[n] ? n : "play", 22, "foreground");
    tint(ic, "foreground");
    controls.appendChild(ic);
  }
  append(open, top, controls);
  combine([compact, open], s, "Dynamic Island", 700);
}

async function componentsPage() {
  const { board } = await makePage("Components");
  const intro = frame("Intro", { dir: "VERTICAL", gap: 8, align: "MIN" });
  append(intro, await text("Components", "Display/M"), await text("Bound to the Kinetic UI variables. Select a frame and set its Kinetic UI mode to Light to see the light theme.", "Body/M", "muted"));
  board.appendChild(intro);
  await buttons(board);
  await badges(board);
  await fields(board);
  await toggles(board);
  await selectAndTabs(board);
  await avatars(board);
  await feedback(board);
  await surfaces(board);
  await island(board);
  return board;
}

/* ------------------------------------------------------------------ run */

async function main() {
  const existing = (await figma.variables.getLocalVariableCollectionsAsync()).some((c) => c.name === KIT);
  if (existing) {
    figma.closePlugin("This file already has the Kinetic UI kit. Run the plugin in a new file for a fresh copy.");
    return;
  }
  figma.notify("Building the Kinetic UI kit…", { timeout: 2500 });
  await loadFonts();
  createVariables();
  createStyles();
  await coverPage();
  await foundationsPage();
  await iconsPage();
  await componentsPage();
  const cover = figma.root.children.find((p) => p.name === "Cover");
  if (cover) await figma.setCurrentPageAsync(cover);
  // A new file starts with an empty "Page 1"; tidy it away.
  for (const p of figma.root.children) {
    if (p === cover || !/^Page \d+$/.test(p.name)) continue;
    await p.loadAsync();
    if (p.children.length === 0 && figma.root.children.length > 1) p.remove();
  }
  const fallbacks = Object.entries(FONTS).filter(([role, f]) => resolved[role] !== f.family).map(([, f]) => f.family);
  figma.closePlugin(
    `Kinetic UI kit v${version} is ready${fallbacks.length ? `. Install ${fallbacks.join(" and ")} for the exact type` : ""}.`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  figma.closePlugin(`Kinetic UI kit failed: ${err instanceof Error ? err.message : String(err)}`);
});
