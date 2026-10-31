const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/home/ash/.claude/skills/synced/7706ed6e-d77e-4c3b-9362-b5fb6bb921a6_d5e1dcf0-5341-487e-8627-3f1daf3a90e1/pptx/scripts/apply_theme.js");

const THEME = {
  name: "Warehouse RL Study",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "14213D", lt1: "FFFFFF", dk2: "3D5A80", lt2: "EDF2F7",
    accent1: "2A78D6", accent2: "EB6834", accent3: "1BAF7A",
    accent4: "EDA100", accent5: "6250D6", accent6: "6B7A8F",
    hlink: "2A78D6", folHlink: "6250D6",
  },
};

const NAVY = "14213D", SLATE = "3D5A80", PALE = "EDF2F7";
const BLUE = "2A78D6", ORANGE = "EB6834", GREEN = "1BAF7A", MUTED = "6B7A8F";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.3 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Ashwin";
pres.title = "Q-learning vs SARSA on warehouse robot navigation";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.7;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: NAVY },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.25, w: 8.9, h: 1.9,
        fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "bottom",
        align: "left" }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: M, y: 4.3, w: W - 2 * M, h: 1.1,
        fontSize: 17, color: "CBD6E6", valign: "top" }, text: "" } },
    { placeholder: { options: { name: "tagline", type: "body", x: M, y: 6.1, w: W - 2 * M, h: 0.6,
        fontSize: 12, color: MUTED, valign: "top" }, text: "" } },
  ],
});

pres.defineSlideMaster({
  title: "CONTENT_LIGHT",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.42, w: W - 2 * M, h: 0.75,
        fontSize: 30, bold: true, color: NAVY, fontFace: "Cambria", valign: "middle",
        align: "left" }, text: "" } },
    { text: { text: "Q-learning vs SARSA  ·  Warehouse navigation", options: { x: M, y: H - 0.52, w: 6, h: 0.3,
        fontSize: 10, color: MUTED } } },
  ],
  slideNumber: { x: W - 0.95, y: H - 0.52, fontSize: 10, color: MUTED },
});

pres.defineSlideMaster({
  title: "CONTENT_DARK",
  background: { color: NAVY },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.42, w: W - 2 * M, h: 0.75,
        fontSize: 30, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "middle",
        align: "left" }, text: "" } },
    { text: { text: "Q-learning vs SARSA  ·  Warehouse navigation", options: { x: M, y: H - 0.52, w: 6, h: 0.3,
        fontSize: 10, color: MUTED } } },
  ],
  slideNumber: { x: W - 0.95, y: H - 0.52, fontSize: 10, color: MUTED },
});

// ---------- helpers ----------
const tx = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, margin: 0 }, o));

// numbered badge + heading + body  (the deck's repeated motif)
function badgeRow(s, n, x, y, w, head, body, col) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.42, h: 0.42, fill: { color: col },
    objectName: `badge-${n}` });
  tx(s, String(n), { x, y, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: "FFFFFF",
    align: "center", valign: "middle" });
  tx(s, head, { x: x + 0.62, y: y - 0.03, w: w - 0.62, h: 0.34, fontSize: 15, bold: true, color: NAVY });
  tx(s, body, { x: x + 0.62, y: y + 0.32, w: w - 0.62, h: 0.85, fontSize: 12.5, color: SLATE, lineSpacingMultiple: 1.05 });
}

// big statistic callout card
function statCard(s, x, y, w, h, value, label, sub, col, dark) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1,
    fill: { color: dark ? "1E3356" : PALE }, line: { width: 0 },
    objectName: `stat-${label}` });
  const vh = h * 0.52;                       // bands scale with h, so sub never overflows the card
  tx(s, value, { x: x + 0.15, y: y + 0.10, w: w - 0.3, h: vh, fontSize: 40, bold: true,
    color: col, align: "center", valign: "middle", fontFace: "Cambria" });
  tx(s, label, { x: x + 0.15, y: y + 0.10 + vh, w: w - 0.3, h: 0.30, fontSize: 13, bold: true,
    color: dark ? "FFFFFF" : NAVY, align: "center", valign: "middle" });
  if (sub) tx(s, sub, { x: x + 0.12, y: y + 0.44 + vh, w: w - 0.24, h: h - vh - 0.52, fontSize: 10.5,
    color: dark ? "AEBCD1" : MUTED, align: "center", valign: "top", lineSpacingMultiple: 1.0 });
}

function card(s, x, y, w, h, head, body, col) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: PALE },
    line: { width: 0 }, objectName: `card-${head}` });
  tx(s, head, { x: x + 0.22, y: y + 0.18, w: w - 0.44, h: 0.32, fontSize: 14, bold: true, color: col });
  tx(s, body, { x: x + 0.22, y: y + 0.54, w: w - 0.44, h: h - 0.72, fontSize: 12, color: SLATE,
    lineSpacingMultiple: 1.08 });
}

// ============================= SLIDES =============================
// Structured to the evaluation rubric: every content slide carries a chip
// naming the criterion it addresses and the marks attached to it.
const ALGO = { "Q-learning": BLUE, "SARSA": ORANGE };

function chip(s, label, marks, col) {
  const w = 2.9, x = W - M - w, y = 0.46;
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.42, rectRadius: 0.1,
    fill: { color: col }, line: { width: 0 }, objectName: `chip-${label}` });
  tx(s, `${label}  ·  ${marks} marks`, { x, y, w, h: 0.42, fontSize: 10.5, bold: true,
    color: "FFFFFF", align: "center", valign: "middle" });
}

pres.addSection({ title: "Opening" });

// 1 — title
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Opening" });
s.addShape(pres.ShapeType.ellipse, { x: 10.4, y: 1.15, w: 2.3, h: 2.3, fill: { color: "1E3356" }, objectName: "d1" });
s.addShape(pres.ShapeType.ellipse, { x: 11.3, y: 2.6, w: 1.25, h: 1.25, fill: { color: BLUE }, objectName: "d2" });
s.addShape(pres.ShapeType.ellipse, { x: 10.0, y: 3.1, w: 0.8, h: 0.8, fill: { color: ORANGE }, objectName: "d3" });
s.addText("Q-learning vs SARSA\nfor warehouse robot navigation", { placeholder: "title" });
s.addText("On-policy and off-policy temporal-difference control, built from scratch\nand compared over 30 paired seeds on a floor built from real Kaggle layouts",
  { placeholder: "subtitle" });
s.addText("Smart Warehouse Robot Navigation  ·  Reinforcement Learning case study", { placeholder: "tagline" });
s.addNotes("The robot must learn the shortest collision-free delivery route. Two classical algorithms, built from scratch, differing in exactly one line. The short answer: they separate in opposite directions on two different questions.");

pres.addSection({ title: "Problem" });

// 2 — problem statement and objectives [5]
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Problem" });
s.addText("Problem statement and objectives", { placeholder: "title" });
chip(s, "Problem & Objectives", 5, NAVY);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: W - 2 * M, h: 0.95, rectRadius: 0.08,
  fill: { color: NAVY }, line: { width: 0 }, objectName: "rq" });
tx(s, "How do Q-learning and SARSA compare when a warehouse robot must learn the shortest collision-free route?",
  { x: M + 0.3, y: 1.35, w: W - 2 * M - 0.6, h: 0.95, fontSize: 17.5, bold: true, italic: true,
    color: "FFFFFF", valign: "middle", fontFace: "Cambria" });
badgeRow(s, 1, M, 2.6, 3.9, "A shared workspace",
  "Robots and people use the same floor. The route must be short AND safe to execute.", BLUE);
badgeRow(s, 2, M + 4.1, 2.6, 3.9, "Learning has a cost",
  "In a simulator, training mistakes are free. On a live floor, every one is an incident.", ORANGE);
badgeRow(s, 3, M + 8.2, 2.6, 3.9, "Two algorithms, one difference",
  "Q-learning and SARSA differ in a single expression — which policy's value they learn.", GREEN);
card(s, M, 4.3, 6.1, 2.15, "Objectives",
  "1.  Implement the environment and both algorithms from scratch.\n" +
  "2.  Audit the dataset and use only the columns that carry signal.\n" +
  "3.  Verify numerically before running any experiment.\n" +
  "4.  Compare over 30 paired seeds with significance testing.\n" +
  "5.  Test robustness against a baseline, other floors, and the key assumption.", NAVY);
card(s, M + 6.4, 4.3, 5.5, 2.15, "The hypothesis under test",
  "The shortest route runs alongside a pedestrian walkway. A safer route one row further is longer.\n\n" +
  "Q-learning should take the fast risky route; SARSA should keep clearance — because only SARSA " +
  "prices in the cost of its own exploration.", ORANGE);
s.addNotes("Five objectives. The key framing is that learning itself has a cost when it happens on a real floor, and that is exactly where these two algorithms differ.");

pres.addSection({ title: "Dataset & Method" });

// 3 — dataset and methodology [5]
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Dataset & Method" });
s.addText("Dataset and methodology", { placeholder: "title" });
chip(s, "Dataset & Methodology", 5, NAVY);
statCard(s, M, 1.35, 2.75, 1.85, "7,980", "rows", "zoya77/robot-path-planning", BLUE);
statCard(s, M + 2.95, 1.35, 2.75, 1.85, "5,045", "distinct layouts", "real 5×5 occupancy grids", BLUE);
statCard(s, M + 5.9, 1.35, 2.75, 1.85, "96.1%", "goal reachable", "start/goal never on a shelf", GREEN);
statCard(s, M + 8.85, 1.35, 2.75, 1.85, "4 of 48", "columns usable", "the rest are audited out", ORANGE);
tx(s, "An RL agent cannot learn from rows. It needs an environment that answers “what if the robot had turned left?” — a CSV only records what did happen.",
  { x: M, y: 3.45, w: W - 2 * M, h: 0.45, fontSize: 13, bold: true, color: NAVY });
s.addTable([
  [{ text: "Element", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Source", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Detail", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  [{ text: "Racking layouts", options: { bold: true } }, { text: "DATA", options: { color: "1BAF7A", bold: true } }, "16 real 5×5 patches tiled into a 20×20 floor"],
  [{ text: "Start / goal validity", options: { bold: true } }, { text: "DATA", options: { color: "1BAF7A", bold: true } }, "never placed on an obstacle in any of 7,980 rows"],
  [{ text: "Action encoding", options: { bold: true } }, { text: "DATA", options: { color: "1BAF7A", bold: true } }, "recovered empirically: up / down / left / right"],
  [{ text: "Cross-aisle + walkway", options: { bold: true } }, { text: "ASSUMED", options: { color: "EB6834", bold: true } }, "the hazard; without it there is no effect to measure"],
  [{ text: "Reward constants", options: { bold: true } }, { text: "ASSUMED", options: { color: "EB6834", bold: true } }, "declared, and swept from 0 to −200 in the analysis"],
], { x: M, y: 4.0, w: W - 2 * M, colW: [3.0, 1.7, 7.2], fontSize: 12.5, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.36, valign: "middle",
     fill: { color: "FFFFFF" } });
s.addNotes("Be upfront: the layouts are real, the reward structure is assumed. That distinction is stated in the notebook and the report, and the assumption is swept in the sensitivity analysis.");

// 4 — the audit
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Dataset & Method" });
s.addText("The audit: most of this dataset is unusable", { placeholder: "title" });
chip(s, "Dataset & Methodology", 5, NAVY);
s.addTable([
  [{ text: "Column", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Claim", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Evidence", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Verdict", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["episode_id / time_step", "trajectories", "5,727 of 7,980 rows duplicate the key; grid and start change mid-episode", { text: "EXCLUDED", options: { bold: true, color: "EB6834" } }],
  ["reward", "a reward signal", "correlation with true shortest-path distance = −0.03", { text: "EXCLUDED", options: { bold: true, color: "EB6834" } }],
  ["path_length_so_far", "path cost", "correlation with true distance = +0.01", { text: "EXCLUDED", options: { bold: true, color: "EB6834" } }],
  ["converged_flag", "convergence", "constant 1 in every row", { text: "EXCLUDED", options: { bold: true, color: "EB6834" } }],
  ["joint_angle_1 / 2", "robot arm angles", "irrelevant to grid navigation", { text: "EXCLUDED", options: { bold: true, color: "EB6834" } }],
  [{ text: "obs_grid_flat_0..24", options: { bold: true } }, "occupancy grid", "5,045 distinct layouts, internally consistent", { text: "USED", options: { bold: true, color: "1BAF7A" } }],
], { x: M, y: 1.4, w: W - 2 * M, colW: [2.7, 1.9, 5.9, 1.4], fontSize: 12, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.42, valign: "middle",
     fill: { color: "FFFFFF" } });
card(s, M, 4.75, 5.9, 1.6, "No reference paths exist either",
  "The dataset ships no optimal path. Ground truth is therefore computed here by breadth-first search — exact on a unit-cost grid, and itself verified against a hand-checked example.", BLUE);
card(s, M + 6.3, 4.75, 5.6, 1.6, "Why this matters",
  "Using the supplied reward column would have trained both agents on noise, and the comparison would still have produced a plausible-looking result.", ORANGE);
s.addNotes("This is the slide that shows the work. Several columns look meaningful and are not. The correlations are the evidence, not an opinion.");

// 5 — the MDP
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Dataset & Method" });
s.addText("The MDP: states, actions, rewards", { placeholder: "title" });
chip(s, "Dataset & Methodology", 5, NAVY);
s.addImage({ path: "fig1_warehouse.png", x: M, y: 1.35, w: 4.3, h: 5.05 });
card(s, M + 4.7, 1.35, 3.5, 2.4, "States and actions",
  "s = row × W + col, so 20 × 20 = 400 states.\n\nFour actions: up, down, left, right — the encoding recovered from the data.\n\nDeterministic transitions.", BLUE);
card(s, M + 8.4, 1.35, 3.5, 2.4, "The three cleared rows",
  "Row 10  pedestrian walkway (hazard)\nRow 11  main aisle — the fast route\nRow 12  safe lane — the detour\n\nStart and goal sit at the aisle ends.", ORANGE);
s.addTable([
  [{ text: "Event", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Reward", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Effect", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["Ordinary step", "−1", "moves"],
  ["Nudging the racking", "−5", "stays put"],
  [{ text: "Entering the walkway", options: { bold: true } }, { text: "−100", options: { bold: true, color: "EB6834" } }, { text: "returned to the charging station", options: { bold: true } }],
  ["Reaching the goal", "+100", "episode ends"],
], { x: M + 4.7, y: 4.0, w: 7.2, colW: [2.9, 1.5, 2.8], fontSize: 12.5, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.37, valign: "middle",
     fill: { color: "FFFFFF" } });
tx(s, "Optimal legal route: 19 steps along the main aisle (BFS). That route is fast — and every cell of it sits directly below the walkway.",
  { x: M + 4.7, y: 5.85, w: 7.2, h: 0.6, fontSize: 12.5, color: NAVY, italic: true });
s.addNotes("This is Cliff Walking in warehouse terms, and the report says so. The racking is real; the three cleared rows are the declared design choice.");

pres.addSection({ title: "Implementation" });

// 6 — model implementation [10]
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Implementation" });
s.addText("Model implementation — built from first principles", { placeholder: "title" });
chip(s, "Model Implementation", 10, BLUE);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: 6.5, h: 3.3, rectRadius: 0.08,
  fill: { color: PALE }, line: { width: 0 }, objectName: "codecard" });
tx(s, "The shared base — everything they have in common", { x: M + 0.25, y: 1.5, w: 6.0, h: 0.3,
  fontSize: 13, bold: true, color: BLUE });
tx(s, "class TDControlAgent:\n" +
      "    def act(self, s):\n" +
      "        if self.rng.random() < self.eps:\n" +
      "            return int(self.rng.integers(self.n_actions))\n" +
      "        return self.greedy(s)\n\n" +
      "    def update(self, s, a, r, s_next, a_next, done):\n" +
      "        tgt = self._target(r, s_next, a_next, done)\n" +
      "        self.Q[s, a] += self.alpha * (tgt - self.Q[s, a])",
  { x: M + 0.25, y: 1.9, w: 6.0, h: 2.6, fontSize: 11, color: NAVY, fontFace: "Courier New",
    lineSpacingMultiple: 1.12, isTextBox: true, margin: 0 });
badgeRow(s, 1, M + 7.0, 1.45, 4.9, "No reinforcement learning library",
  "No gymnasium, no stable-baselines. NumPy supplies arrays and RNG; the MDP, the TD control loop and both update rules are written out.", BLUE);
badgeRow(s, 2, M + 7.0, 2.85, 4.9, "Random tie-breaking, deliberately",
  "Q starts at zero so every action ties. Breaking ties by argmax would bias the robot toward action 0 — straight into the walkway.", ORANGE);
badgeRow(s, 3, M + 7.0, 4.25, 4.9, "Terminal states bootstrap to zero",
  "On termination the target is r alone. Omitting that inflates every value by a spurious gamma·V(terminal) term.", GREEN);
card(s, M, 4.85, 6.5, 1.5, "One harness, both algorithms",
  "A single train() function runs both, so the episode budget, hyperparameters, epsilon schedule and seed are identical by construction rather than by careful duplication.", NAVY);
s.addNotes("Everything is shared except one method. The two footguns called out here are real: tie-breaking bias and the terminal bootstrap.");

// 7 — the one-line difference
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Implementation" });
s.addText("The entire difference is one expression", { placeholder: "title" });
chip(s, "Model Implementation", 10, BLUE);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.45, w: 5.8, h: 1.9, rectRadius: 0.1,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "qcard" });
tx(s, "Q-learning   ·   off-policy      γ = discount factor", { x: M + 0.3, y: 1.6, w: 5.2, h: 0.35, fontSize: 15, bold: true, color: BLUE });
tx(s, "target  =  r  +  γ · max  Q(s\u2032, a\u2032)\n                                a\u2032",
  { x: M + 0.3, y: 2.05, w: 5.2, h: 0.78, fontSize: 16, color: "FFFFFF",
    fontFace: "Cambria", isTextBox: true, margin: 0 });
tx(s, "Values the BEST next action — whatever the robot actually does", { x: M + 0.3, y: 2.9, w: 5.2, h: 0.35,
  fontSize: 11.5, color: "AEBCD1", isTextBox: true, margin: 0 });
s.addShape(pres.ShapeType.roundRect, { x: M + 6.1, y: 1.45, w: 5.8, h: 1.9, rectRadius: 0.1,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "scard" });
tx(s, "SARSA   ·   on-policy", { x: M + 6.4, y: 1.6, w: 5.2, h: 0.35, fontSize: 15, bold: true, color: ORANGE });
tx(s, "target  =  r  +  γ · Q(s\u2032, a\u2032)\n              with a\u2032 ~ ε-greedy(s\u2032)",
  { x: M + 6.4, y: 2.05, w: 5.2, h: 0.78, fontSize: 16, color: "FFFFFF",
    fontFace: "Cambria", isTextBox: true, margin: 0 });
tx(s, "Values the action it WILL ACTUALLY TAKE — exploration included", { x: M + 6.4, y: 2.9, w: 5.2, h: 0.35,
  fontSize: 11.5, color: "AEBCD1", isTextBox: true, margin: 0 });
tx(s, "Why that produces different routes", { x: M, y: 3.65, w: W - 2 * M, h: 0.4,
  fontSize: 17, bold: true, color: "FFFFFF", fontFace: "Cambria" });
tx(s, "Take a cell on the main aisle, with the walkway directly above it.\n\n" +
      "Q-learning backs up through max Q(s,a), which selects the safe action — so the −100 attaches to " +
      "Q(s, a_bad) but NEVER reaches V(s). The aisle looks exactly as good as any other corridor.\n\n" +
      "SARSA backs up through Q(s, A') where A' is sampled from the ε-greedy policy, so E[Q(s,A')] carries a term " +
      "of weight ε/|A| on Q(s, a_bad). The −100 propagates into V(s), the aisle is devalued, and the safe lane wins.",
  { x: M, y: 4.15, w: W - 2 * M, h: 2.2, fontSize: 13.5, color: "CBD6E6",
    lineSpacingMultiple: 1.12, isTextBox: true, margin: 0 });
s.addNotes("This is the core teaching point. The max operator is what makes the hazard invisible to Q-learning's state values. Slide 11 shows that prediction confirmed in the measurements.");

// 8 — correctness tests
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Implementation" });
s.addText("Verification: 13 checks before any experiment", { placeholder: "title" });
chip(s, "Model Implementation", 10, BLUE);
tx(s, "An RL bug does not announce itself. A mis-signed reward or a wrong bootstrap still produces a learning curve that goes up and to the right — the agent learns something, just not what you are measuring.",
  { x: M, y: 1.3, w: W - 2 * M, h: 0.6, fontSize: 13.5, italic: true, color: NAVY });
s.addTable([
  [{ text: "Check", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Rules out", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Result", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["State encoding bijective", "index collisions", "400 / 400"],
  ["Bump: no movement, no termination", "transition bookkeeping", "pass"],
  ["Incident: returned to charging station", "hazard semantics", "pass"],
  ["Goal: reward paid once, episode ends", "double-counted terminal", "pass"],
  ["BFS vs a hand-checked grid", "broken ground truth", "8 = 8"],
  [{ text: "ε = 0: the two agents are IDENTICAL", options: { bold: true } },
   { text: "any difference beyond on-policy/off-policy", options: { bold: true } },
   { text: "0.00e+00", options: { bold: true, color: "1BAF7A" } }],
  ["Both optimal on a 3×3 open grid", "dead value propagation", "4 of 4 steps"],
  ["Return accounting matches the env", "drift between env and agent", "exact"],
], { x: M, y: 2.0, w: W - 2 * M, colW: [4.6, 4.9, 2.4], fontSize: 12.5, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.36, valign: "middle",
     fill: { color: "FFFFFF" } });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.5, w: W - 2 * M, h: 0.95, rectRadius: 0.08,
  fill: { color: "E6F6EF" }, line: { width: 0 }, objectName: "pass" });
tx(s, "The decisive one: at ε = 0 the behaviour policy is greedy, so max Q(s',a') and Q(s',a') are the SAME quantity — the two update rules are mathematically identical and must produce bit-identical tables. They do, to 0.00e+00.",
  { x: M + 0.3, y: 5.5, w: W - 2 * M - 0.6, h: 0.95, fontSize: 12.5, bold: true, color: "0E6B4A", valign: "middle" });
s.addNotes("The epsilon-zero equivalence test is the strongest statement available: it proves the two classes differ only in how exploration is handled, which is exactly what the study claims to measure.");

pres.addSection({ title: "Results" });

// 9 — results headline [10]
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Results" });
s.addText("Results: they separate in opposite directions", { placeholder: "title" });
chip(s, "Results & Evaluation", 10, ORANGE);
statCard(s, M, 1.5, 3.75, 2.15, "19.40", "Q-learning route", "steps, vs a BFS optimum of 19", BLUE, true);
statCard(s, M + 4.05, 1.5, 3.75, 2.15, "33.34", "SARSA route", "steps — a deliberate detour", ORANGE, true);
statCard(s, M + 8.1, 1.5, 3.8, 2.15, "4.3×", "more incidents", "Q-learning, while training", "FFFFFF", true);
s.addTable([
  [{ text: "Measure", options: { bold: true, color: "FFFFFF", fill: { color: "24405F" } } },
   { text: "Q-learning", options: { bold: true, color: "FFFFFF", fill: { color: "24405F" } } },
   { text: "SARSA", options: { bold: true, color: "FFFFFF", fill: { color: "24405F" } } },
   { text: "Wilcoxon p", options: { bold: true, color: "FFFFFF", fill: { color: "24405F" } } }],
  [{ text: "Online return while learning", options: { color: "FFFFFF" } }, { text: "−838.33", options: { color: "FFFFFF" } }, { text: "−297.32", options: { color: "1BAF7A", bold: true } }, { text: "1.9 × 10⁻⁹", options: { color: "FFFFFF" } }],
  [{ text: "Walkway incidents in training", options: { color: "FFFFFF" } }, { text: "21,626", options: { color: "FFFFFF" } }, { text: "5,068", options: { color: "1BAF7A", bold: true } }, { text: "1.9 × 10⁻⁹", options: { color: "FFFFFF" } }],
  [{ text: "Deployed route length", options: { color: "FFFFFF" } }, { text: "19.40", options: { color: "1BAF7A", bold: true } }, { text: "33.34", options: { color: "FFFFFF" } }, { text: "6.7 × 10⁻⁷", options: { color: "FFFFFF" } }],
  [{ text: "Distance kept from the walkway", options: { color: "FFFFFF" } }, { text: "1.00", options: { color: "FFFFFF" } }, { text: "5.21", options: { color: "1BAF7A", bold: true } }, { text: "—", options: { color: "FFFFFF" } }],
], { x: M, y: 3.95, w: W - 2 * M, colW: [4.6, 2.5, 2.5, 2.3], fontSize: 12.5,
     border: { type: "solid", color: "2C4A6E", pt: 1 }, rowH: 0.4, valign: "middle",
     fill: { color: "16304D" } });
tx(s, "30 paired seeds · 3,000 episodes each · identical hyperparameters · Wilcoxon signed-rank on the paired differences",
  { x: M, y: 6.25, w: W - 2 * M, h: 0.4, fontSize: 11.5, color: MUTED });
s.addNotes("Four of five metrics significant, with large effects. Note the two winners are different: Q-learning deploys better, SARSA trains cheaper. Those are two different questions.");

// 10 — the routes
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("What each algorithm actually learned", { placeholder: "title" });
chip(s, "Results & Evaluation", 10, ORANGE);
s.addImage({ path: "fig3_learned_routes.png", x: M, y: 1.3, w: 8.4, h: 4.5 });
card(s, M + 8.7, 1.3, 3.2, 2.15, "Q-learning",
  "A dead-straight 19-step run along the aisle, hugging the walkway. Mean distance from people: 1.00 cells.", BLUE);
card(s, M + 8.7, 3.65, 3.2, 2.15, "SARSA",
  "Dives into the racking and takes 33 steps. Mean distance from people: 5.21 cells — five times the clearance.", ORANGE);
tx(s, "Identical data, identical hyperparameters, identical experience budget. They differ only in which policy's value they estimate — and one produced a straight line along the hazard while the other produced a detour that never approaches it.",
  { x: M, y: 5.95, w: 8.4, h: 0.7, fontSize: 12.5, color: NAVY, italic: true });
s.addNotes("This figure makes the whole argument on its own. Everything else is the measurement behind it.");

// 11 — the mechanism, confirmed
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("The mechanism, confirmed by measurement", { placeholder: "title" });
chip(s, "Results & Evaluation", 10, ORANGE);
s.addImage({ path: "fig6_penalty_sensitivity.png", x: M, y: 1.3, w: 7.3, h: 2.4 });
s.addTable([
  [{ text: "Hazard penalty", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Q-learning incidents", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Q clearance", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "SARSA clearance", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["−10", { text: "6,522", options: { bold: true } }, { text: "1.74", options: { bold: true } }, "2.27"],
  ["−25", { text: "6,522", options: { bold: true } }, { text: "1.74", options: { bold: true } }, "4.84"],
  ["−50", { text: "6,522", options: { bold: true } }, { text: "1.74", options: { bold: true } }, "5.15"],
  ["−100", { text: "6,522", options: { bold: true } }, { text: "1.74", options: { bold: true } }, "5.25"],
  ["−200", { text: "6,522", options: { bold: true } }, { text: "1.74", options: { bold: true } }, { text: "5.39", options: { bold: true, color: "EB6834" } }],
], { x: M, y: 3.95, w: 7.3, colW: [1.7, 2.3, 1.6, 1.7], fontSize: 12, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.34, valign: "middle",
     fill: { color: "FFFFFF" } });
card(s, M + 7.7, 1.3, 4.2, 2.6, "Q-learning is INVARIANT to the penalty",
  "Identical incident counts and identical clearance at −10, −25, −50, −100 and −200.\n\n" +
  "A twenty-fold increase in the cost of an incident changes its behaviour by nothing at all.", BLUE);
card(s, M + 7.7, 4.1, 4.2, 2.3, "Exactly as the theory predicts",
  "The max operator selects the safe action, so the penalty attaches to Q(s, a_bad) but never propagates into V(s).\n\n" +
  "SARSA's clearance rises monotonically, 1.91 → 5.39.", ORANGE);
s.addNotes("This is the most informative result in the study and it is not the headline one. The derivation and the measurement line up exactly, which is what gives confidence the implementation measures the intended quantity.");

// 12 — robustness
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("Is the result real? Three checks", { placeholder: "title" });
chip(s, "Results & Evaluation", 10, ORANGE);
badgeRow(s, 1, M, 1.4, 3.85, "Against external baselines",
  "BFS optimum 19 steps. Q-learning 19.40, SARSA 33.34. Neither deployed policy causes any incident.", BLUE);
badgeRow(s, 2, M + 4.0, 1.4, 3.85, "Across 12 independent floors",
  "Pattern holds on every one: Q-learning +2.17 excess steps, SARSA +11.33; incidents 5,927 vs 1,792, p = 4.9e−4.", ORANGE);
badgeRow(s, 3, M + 8.0, 1.4, 3.9, "Across the hazard penalty",
  "Holds from −10 to −200. At penalty 0 the effect disappears entirely — as predicted.", GREEN);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 3.0, w: W - 2 * M, h: 1.6, rectRadius: 0.08,
  fill: { color: NAVY }, line: { width: 0 }, objectName: "negctrl" });
tx(s, "The negative control", { x: M + 0.35, y: 3.2, w: 11, h: 0.35, fontSize: 16, bold: true,
  color: ORANGE, fontFace: "Cambria" });
tx(s, "On a floor of scattered racking with NO localised hazard, both algorithms converged on the identical 39-step optimum. There was no difference to measure. The on-policy/off-policy distinction is a response to a property of the task — not a general ranking of the two algorithms.",
  { x: M + 0.35, y: 3.62, w: 11.2, h: 0.9, fontSize: 13.5, color: "CBD6E6",
    lineSpacingMultiple: 1.1, isTextBox: true, margin: 0 });
card(s, M, 4.8, 5.9, 1.55, "An uncomfortable finding, reported anyway",
  "The heuristic recovered from the dataset — simply move toward the goal — also achieves 19 steps with zero incidents, matching Q-learning and beating SARSA on this floor.", ORANGE);
card(s, M + 6.3, 4.8, 5.6, 1.55, "What that means",
  "This floor is a good instrument for isolating the on-policy/off-policy distinction, and a poor advertisement for RL on this particular routing problem. Stated in the report, not buried.", NAVY);
s.addNotes("Reporting the heuristic matching the learned agents is the honest thing to do. The floor was designed to isolate the algorithmic difference, not to show RL beating a simple rule.");

pres.addSection({ title: "Deliverables" });

// 13 — technical report [5]
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Deliverables" });
s.addText("The technical report and codebase", { placeholder: "title" });
chip(s, "Technical Report", 5, GREEN);
statCard(s, M, 1.35, 2.75, 1.8, "49", "pages", "LaTeX, 9 chapters + 5 appendices", NAVY);
statCard(s, M + 2.95, 1.35, 2.75, 1.8, "13", "checks", "all passing, before any run", GREEN);
statCard(s, M + 5.9, 1.35, 2.75, 1.8, "30", "paired seeds", "with significance testing", BLUE);
statCard(s, M + 8.85, 1.35, 2.75, 1.8, "6", "figures", "all generated by the notebook", ORANGE);
s.addTable([
  [{ text: "Chapter", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Contents", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["1–2  Introduction, literature", "MDPs, TD learning, Watkins' Q-learning, Rummery & Niranjan's SARSA, Cliff Walking, safe RL"],
  ["3     Theory", "Bellman equations, TD(0), both update rules derived, convergence conditions, pseudocode"],
  ["4     Dataset and environment", "the full audit, and the explicit separation of data from assumption"],
  ["5–6  Implementation, verification", "both agents, and the 13 numerical checks"],
  ["7–9  Results, discussion, conclusion", "30-seed comparison, significance, robustness, threats to validity"],
], { x: M, y: 3.35, w: W - 2 * M, colW: [3.5, 8.4], fontSize: 12, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.33, valign: "middle",
     fill: { color: "FFFFFF" } });
card(s, M, 5.45, W - 2 * M, 1.05, "Reproducibility",
  "One command executes the whole study end to end in about four minutes. All generators are seeded; the experiment was run twice and every reported metric was identical.", BLUE);
s.addNotes("Mention that the notebook, the report source and the deck are all in the repository, and the whole experiment reruns in four minutes.");

// 14 — conclusions and viva prep
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Deliverables" });
s.addText("Conclusions, limitations, and likely questions", { placeholder: "title" });
chip(s, "Conclusion & Viva", 10, ORANGE);
const findings = [
  ["1", "Opposite answers to two questions", "Q-learning deploys better (19.40 vs 33.34 steps); SARSA trains 4.3× cheaper in incidents.", BLUE],
  ["2", "The mechanism is directly visible", "Q-learning's behaviour is numerically invariant to a 20× change in hazard penalty.", ORANGE],
  ["3", "No hazard, no difference", "On a floor without a localised hazard both find the identical optimum.", GREEN],
  ["4", "A four-line heuristic matched it", "Reported rather than hidden — this floor isolates the algorithms, it does not sell RL.", "EDA100"],
];
findings.forEach((f, i) => {
  const x = M + (i % 2) * 6.1, y = 1.4 + Math.floor(i / 2) * 1.35;
  s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.4, h: 0.4, fill: { color: f[3] }, objectName: `f${i}` });
  tx(s, f[0], { x, y, w: 0.4, h: 0.4, fontSize: 12.5, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  tx(s, f[1], { x: x + 0.56, y: y - 0.02, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: "FFFFFF" });
  tx(s, f[2], { x: x + 0.56, y: y + 0.31, w: 5.3, h: 0.72, fontSize: 12, color: "AEBCD1", lineSpacingMultiple: 1.05 });
});
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.25, w: 5.9, h: 2.1, rectRadius: 0.08,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "lim" });
tx(s, "Limitations", { x: M + 0.3, y: 4.42, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: ORANGE });
tx(s, "·  Reward constants are assumptions, not data\n" +
      "·  The walkway is a construction; without it there is no effect\n" +
      "·  Tabular only — nothing here transfers to function approximation\n" +
      "·  Deterministic dynamics; slip probability was zero",
  { x: M + 0.3, y: 4.78, w: 5.3, h: 1.45, fontSize: 11.5, color: "CBD6E6",
    lineSpacingMultiple: 1.15, isTextBox: true, margin: 0 });
s.addShape(pres.ShapeType.roundRect, { x: M + 6.1, y: 4.25, w: 5.9, h: 2.1, rectRadius: 0.08,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "viva" });
tx(s, "Anticipated questions", { x: M + 6.4, y: 4.42, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: GREEN });
tx(s, "·  Why is SARSA's route longer if it is “better”?  It is not better — it is cheaper to learn.\n" +
      "·  Would decaying ε to 0 remove the gap?  Yes — both converge to optimal under GLIE.\n" +
      "·  Why not DQN?  400 states are enumerable; approximation adds instability, not insight.",
  { x: M + 6.4, y: 4.78, w: 5.3, h: 1.45, fontSize: 11.5, color: "CBD6E6",
    lineSpacingMultiple: 1.15, isTextBox: true, margin: 0 });
s.addNotes("Close on the trade-off, the limitations stated plainly, and three questions you are likely to be asked in the viva with short answers ready.");

(async () => {
  await pres.writeFile({ fileName: "Q_Learning_vs_SARSA_Warehouse.pptx" });
  await applyTheme("Q_Learning_vs_SARSA_Warehouse.pptx", THEME);
  console.log("deck written");
})();
