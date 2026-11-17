/**
 * Line diffs and three-way merges, with no dependencies.
 *
 * `merge3(base, yours, theirs)` keeps your edits and takes upstream changes wherever they don't touch
 * the same lines. Where both sides changed the same lines it writes git-style conflict markers.
 */

export type Hunk = {
  /** Range in the old text, end exclusive. */
  oStart: number;
  oEnd: number;
  /** Range in the new text, end exclusive. */
  nStart: number;
  nEnd: number;
};

export const splitLines = (s: string) => {
  if (s === "") return [];
  const lines = s.split("\n");
  // A trailing newline produces an empty last element; keep it out of the diff and add it back on join.
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
};

const joinLines = (lines: string[], trailing: boolean) => lines.join("\n") + (trailing && lines.length ? "\n" : "");

/** Myers' O(ND) diff over lines. Returns the changed regions. */
export function diffLines(a: string[], b: string[]): Hunk[] {
  // Trim the common prefix and suffix first: most edits are small and local.
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const A = a.slice(pre, a.length - suf);
  const B = b.slice(pre, b.length - suf);
  const n = A.length, m = B.length;
  if (n === 0 && m === 0) return [];
  if (n === 0 || m === 0) return [{ oStart: pre, oEnd: pre + n, nStart: pre, nEnd: pre + m }];

  const max = n + m;
  const off = max;
  const v = new Int32Array(2 * max + 2);
  const trace: Int32Array[] = [];
  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[off + k - 1]! < v[off + k + 1]!) ? v[off + k + 1]! : v[off + k - 1]! + 1;
      let y = x - k;
      while (x < n && y < m && A[x] === B[y]) { x++; y++; }
      v[off + k] = x;
      if (x >= n && y >= m) break outer;
    }
  }

  // Walk the trace backwards to recover the edit script as matched pairs.
  const pairs: [number, number][] = [];
  let x = n, y = m;
  for (let d = trace.length - 1; d > 0; d--) {
    const vv = trace[d]!;
    const k = x - y;
    const prevK = k === -d || (k !== d && vv[off + k - 1]! < vv[off + k + 1]!) ? k + 1 : k - 1;
    const px = vv[off + prevK]!;
    const py = px - prevK;
    while (x > px && y > py) { x--; y--; pairs.push([x, y]); }
    x = px; y = py;
  }
  while (x > 0 && y > 0) { x--; y--; pairs.push([x, y]); }
  pairs.reverse();

  const hunks: Hunk[] = [];
  let ai = 0, bi = 0;
  for (const [pa, pb] of [...pairs, [n, m] as [number, number]]) {
    if (pa > ai || pb > bi) hunks.push({ oStart: pre + ai, oEnd: pre + pa, nStart: pre + bi, nEnd: pre + pb });
    ai = pa + 1;
    bi = pb + 1;
  }
  return hunks;
}

export type MergeResult = { text: string; conflicts: number; changed: boolean };

export type MergeLabels = { yours?: string; theirs?: string };

/** Three-way merge of whole files. */
export function merge3(base: string, yours: string, theirs: string, labels: MergeLabels = {}): MergeResult {
  if (yours === theirs) return { text: yours, conflicts: 0, changed: false };
  if (base === yours) return { text: theirs, conflicts: 0, changed: true };
  if (base === theirs) return { text: yours, conflicts: 0, changed: false };

  const O = splitLines(base), Y = splitLines(yours), T = splitLines(theirs);
  const hy = diffLines(O, Y).map((h) => ({ ...h, side: "y" as const }));
  const ht = diffLines(O, T).map((h) => ({ ...h, side: "t" as const }));
  const all = [...hy, ...ht].sort((p, q) => p.oStart - q.oStart || p.oEnd - q.oEnd);

  // Group hunks whose base ranges overlap or touch.
  type G = { start: number; end: number; hunks: typeof all };
  const groups: G[] = [];
  for (const h of all) {
    const g = groups[groups.length - 1];
    if (g && h.oStart <= g.end) {
      g.end = Math.max(g.end, h.oEnd);
      g.hunks.push(h);
    } else groups.push({ start: h.oStart, end: h.oEnd, hunks: [h] });
  }

  // Where a group's base range lands in one side: shift by that side's edits before the group,
  // and stretch by its edits inside the group.
  const net = (h: Hunk) => (h.nEnd - h.nStart) - (h.oEnd - h.oStart);
  const slice = (lines: string[], side: "y" | "t", g: G) => {
    const mine = g.hunks.filter((h) => h.side === side);
    const before = (side === "y" ? hy : ht).filter((h) => h.oStart < g.start && !mine.includes(h)).reduce((s, h) => s + net(h), 0);
    const inside = mine.reduce((s, h) => s + net(h), 0);
    return { changed: mine.length > 0, lines: lines.slice(g.start + before, g.end + before + inside) };
  };

  const out: string[] = [];
  let conflicts = 0;
  let pos = 0;
  for (const g of groups) {
    out.push(...O.slice(pos, g.start));
    const ys = slice(Y, "y", g);
    const ts = slice(T, "t", g);
    if (!ys.changed) out.push(...ts.lines);
    else if (!ts.changed) out.push(...ys.lines);
    else if (ys.lines.join("\n") === ts.lines.join("\n")) out.push(...ys.lines);
    else {
      conflicts++;
      out.push(`<<<<<<< ${labels.yours ?? "yours"}`, ...ys.lines, "=======", ...ts.lines, `>>>>>>> ${labels.theirs ?? "kinetic"}`);
    }
    pos = g.end;
  }
  out.push(...O.slice(pos));
  const text = joinLines(out, yours.endsWith("\n") || theirs.endsWith("\n"));
  return { text, conflicts, changed: text !== yours };
}

/** A unified diff (git style) between two texts, for display. */
export function unifiedDiff(a: string, b: string, context = 3): { header: string; lines: { kind: " " | "+" | "-"; text: string }[] }[] {
  const A = splitLines(a), B = splitLines(b);
  const hunks = diffLines(A, B);
  const out: { header: string; lines: { kind: " " | "+" | "-"; text: string }[] }[] = [];
  let i = 0;
  while (i < hunks.length) {
    // Merge nearby hunks into one block with shared context.
    let j = i;
    while (j + 1 < hunks.length && hunks[j + 1]!.oStart - hunks[j]!.oEnd <= context * 2) j++;
    const first = hunks[i]!, last = hunks[j]!;
    const oS = Math.max(0, first.oStart - context), oE = Math.min(A.length, last.oEnd + context);
    const nS = Math.max(0, first.nStart - context), nE = Math.min(B.length, last.nEnd + context);
    const lines: { kind: " " | "+" | "-"; text: string }[] = [];
    let o = oS;
    for (let k = i; k <= j; k++) {
      const h = hunks[k]!;
      while (o < h.oStart) lines.push({ kind: " ", text: A[o++]! });
      for (let x = h.oStart; x < h.oEnd; x++) lines.push({ kind: "-", text: A[x]! });
      for (let x = h.nStart; x < h.nEnd; x++) lines.push({ kind: "+", text: B[x]! });
      o = h.oEnd;
    }
    while (o < oE) lines.push({ kind: " ", text: A[o++]! });
    out.push({ header: `@@ -${oS + 1},${oE - oS} +${nS + 1},${nE - nS} @@`, lines });
    i = j + 1;
  }
  return out;
}
