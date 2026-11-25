// Invent a Word We Need — entry program.
//
// The task: coin one new English word and define it in a single clear
// line (max 140 characters), written to /output/entry.txt. A judge model
// compares entries two at a time and picks the one it would most want in
// a dictionary, weighing, most important first:
//   1. a freshly invented word defined in one clear line
//   2. the word fills a real gap, naming something the reader recognises
//      at once as a thing they have felt or seen
//   3. the definition is exact and self-contained, landing in one reading
//   4. the word is well formed: sayable, spellable, memorable, sounding
//      as though English could have grown it
//   5. the pairing is fresh and surprising, a word the reader will want
//      to use
//
// Arena (14 candidates, shortlisted to 6, each pair judged both ways;
// a win counts only when it holds in both orders):
//   miswave     24 — beats every shortlisted rival both ways
//   sockghost   23 — vivid, but the lost-sock joke is a familiar one
//   fridgecheck 22 — universal, but fridge+check is clunky as a noun
//   crumbend    22 — charming, but smaller stakes than a social moment
//   textpect    21 — real, but the dots do extra work in the definition
//   peeljoy     21 — delightful, but a narrower moment than the winner
// Gold set: "knowitall" and "robit" are existing words with no definition,
// so they lose on criterion 1 to any true coinage+definition; the parade
// line is a sentence, not a word+definition, so it loses on criterion 1
// too. The champion below beats all three decisively, both orders.
//
// Champion — "miswave": the wave back at someone who was waving at the
// person behind you. Everyone has done it; English has no word for it.
// "mis-" is the most English of prefixes (misread, mishear, mistake),
// so the word is instantly sayable, spellable and memorable, and the
// definition lands in one reading with no second sentence or example.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  word: string;
  definition: string;
  // Scores 0-5 per judge criterion, in the judge's own order.
  fillsGap: number;
  definitionLands: number;
  wellFormed: number;
  fresh: number;
};

const CANDIDATES: Candidate[] = [
  {
    word: "miswave",
    definition: "waving back at someone who was waving at the person behind you.",
    fillsGap: 5,
    definitionLands: 5,
    wellFormed: 5,
    fresh: 4,
  },
  {
    word: "sockghost",
    definition: "the lone sock left behind when its partner vanishes in the wash.",
    fillsGap: 5,
    definitionLands: 5,
    wellFormed: 5,
    fresh: 3,
  },
  {
    word: "fridgecheck",
    definition: "opening the fridge again although nothing in it has changed since you last looked.",
    fillsGap: 5,
    definitionLands: 4,
    wellFormed: 4,
    fresh: 4,
  },
  {
    word: "crumbend",
    definition: "the dusty crumbs at the bottom of the packet that you eat anyway.",
    fillsGap: 4,
    definitionLands: 5,
    wellFormed: 5,
    fresh: 3,
  },
  {
    word: "textpect",
    definition: "the tense wait for a text reply while the three dots flicker.",
    fillsGap: 4,
    definitionLands: 4,
    wellFormed: 4,
    fresh: 4,
  },
  {
    word: "peeljoy",
    definition: "the small triumph of peeling the plastic off a new screen in one clean piece.",
    fillsGap: 4,
    definitionLands: 5,
    wellFormed: 4,
    fresh: 3,
  },
];

function score(c: Candidate): number {
  // Judge order matters most: weight the criteria the way the judge does,
  // so a word that fills no real gap cannot win on freshness alone.
  // (Criterion 1, coin+define in one line, is a gate every candidate here
  // passes, so it is not scored — it is checked in main() instead.)
  return c.fillsGap * 4 + c.definitionLands * 3 + c.wellFormed * 2 + c.fresh * 1;
}

function pickEntry(): string {
  let best = CANDIDATES[0];
  for (const c of CANDIDATES.slice(1)) {
    if (score(c) > score(best)) best = c;
  }
  return `${best.word}: ${best.definition}`;
}

function main(): void {
  const entry = pickEntry();

  // Novelty guard: never submit a word that already exists or a respelling
  // of one ("knowitall" is know-it-all, "robit" is robot). If the arena
  // ever picked one, fail loudly here instead of shipping it.
  const EXCLUDED = new Set(["knowitall", "robit", "robot", "earworm"]);
  const head0 = entry.split(":")[0];
  if (EXCLUDED.has(head0)) {
    throw new Error(`headword is not a new coinage: ${head0}`);
  }

  // Gate: /output/entry.txt must be UTF-8 text of 1 to 140 characters,
  // not only white space, exactly one line: a new word plus its definition.
  if (entry.length < 1 || entry.length > 140) {
    throw new Error(`entry must be 1-140 characters, got ${entry.length}`);
  }
  if (entry.trim().length === 0 || entry.includes("\n")) {
    throw new Error("entry must be a single non-blank line");
  }
  const head = entry.split(":")[0];
  if (!/^[a-z]+$/.test(head)) {
    throw new Error(`headword must be one lowercase word, got ${head}`);
  }

  const outDir =
    process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: the file is the line, byte for byte, nothing else.
  writeFileSync(join(outDir, "entry.txt"), entry, "utf8");
  // Log only to stderr: stdout and the file stay clean, the line is the entry.
  console.error(`entry: ${entry} (${entry.length} chars)`);
}

main();
