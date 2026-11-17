import { test } from "node:test";
import assert from "node:assert/strict";
import { diffLines, merge3, unifiedDiff } from "../dist/merge.js";

const L = (...a) => a.join("\n") + "\n";
const base = L("a", "b", "c", "d", "e", "f", "g");

test("takes upstream when you made no edits", () => {
  assert.equal(merge3(base, base, L("x")).text, L("x"));
});

test("keeps your edits when upstream is unchanged", () => {
  const yours = L("A", "b", "c", "d", "e", "f", "g");
  assert.deepEqual(merge3(base, yours, base), { text: yours, conflicts: 0, changed: false });
});

test("merges edits on different lines", () => {
  const r = merge3(base, L("A", "b", "c", "d", "e", "f", "g"), L("a", "b", "c", "d", "e", "F", "g"));
  assert.equal(r.conflicts, 0);
  assert.equal(r.text, L("A", "b", "c", "d", "e", "F", "g"));
});

test("accepts identical edits on both sides", () => {
  const same = L("a", "B", "c", "d", "e", "f", "g");
  assert.equal(merge3(base, same, same).text, same);
});

test("marks a conflict when both sides change the same lines", () => {
  const r = merge3(base, L("a", "X", "c", "d", "e", "f", "g"), L("a", "Y", "c", "d", "e", "f", "g"), { yours: "mine", theirs: "kinetic" });
  assert.equal(r.conflicts, 1);
  assert.equal(r.text, L("a", "<<<<<<< mine", "X", "=======", "Y", ">>>>>>> kinetic", "c", "d", "e", "f", "g"));
});

test("handles inserts and deletes on different sides", () => {
  const r = merge3(base, L("a", "b", "new1", "new2", "c", "d", "e", "f", "g"), L("a", "b", "c", "d", "g"));
  assert.equal(r.text, L("a", "b", "new1", "new2", "c", "d", "g"));
});

test("random spaced edits always merge cleanly", () => {
  for (let t = 0; t < 200; t++) {
    const n = 20 + Math.floor(Math.random() * 60);
    const O = Array.from({ length: n }, (_, i) => `l${i}`);
    const Y = [...O], T = [...O], want = [...O];
    for (let i = 1; i < n - 1; i += 6) Y[i] = want[i] = `Y${i}`;
    for (let i = 4; i < n - 1; i += 6) T[i] = want[i] = `T${i}`;
    const r = merge3(L(...O), L(...Y), L(...T));
    assert.equal(r.conflicts, 0);
    assert.equal(r.text, L(...want));
  }
});

test("diff hunks rebuild the new text", () => {
  for (let t = 0; t < 200; t++) {
    const rnd = (n) => Math.floor(Math.random() * n);
    const a = Array.from({ length: rnd(40) }, () => `x${rnd(8)}`);
    const b = Array.from({ length: rnd(40) }, () => `x${rnd(8)}`);
    const out = [];
    let o = 0;
    for (const h of diffLines(a, b)) {
      out.push(...a.slice(o, h.oStart), ...b.slice(h.nStart, h.nEnd));
      o = h.oEnd;
    }
    out.push(...a.slice(o));
    assert.deepEqual(out, b);
  }
});

test("unified diff shows context and changes", () => {
  const [h] = unifiedDiff(base, L("a", "B", "c", "d", "e", "f", "g"), 1);
  assert.equal(h.header, "@@ -1,3 +1,3 @@");
  assert.deepEqual(h.lines.map((l) => l.kind + l.text), [" a", "-b", "+B", " c"]);
});
