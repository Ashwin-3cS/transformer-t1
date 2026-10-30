const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/home/ash/.claude/skills/synced/7706ed6e-d77e-4c3b-9362-b5fb6bb921a6_d5e1dcf0-5341-487e-8627-3f1daf3a90e1/pptx/scripts/apply_theme.js");

const THEME = {
  name: "AG News Architecture Study",
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
pres.title = "BiLSTM vs Transformer on AG News";
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
    { text: { text: "BiLSTM vs Transformer  ·  AG News", options: { x: M, y: H - 0.52, w: 6, h: 0.3,
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
    { text: { text: "BiLSTM vs Transformer  ·  AG News", options: { x: M, y: H - 0.52, w: 6, h: 0.3,
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
pres.addSection({ title: "Opening" });

// 1 — title
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Opening" });
s.addShape(pres.ShapeType.ellipse, { x: 10.4, y: 1.15, w: 2.3, h: 2.3, fill: { color: "1E3356" }, objectName: "deco-a" });
s.addShape(pres.ShapeType.ellipse, { x: 11.3, y: 2.6, w: 1.25, h: 1.25, fill: { color: BLUE }, objectName: "deco-b" });
s.addShape(pres.ShapeType.ellipse, { x: 10.0, y: 3.1, w: 0.8, h: 0.8, fill: { color: ORANGE }, objectName: "deco-c" });
s.addText("Recurrent networks vs. Transformers,\nbuilt from scratch", { placeholder: "title" });
s.addText("How do the two architectures compare at classifying short news texts?\nA controlled study on AG News  ·  four classes  ·  7,600 held-out test documents",
  { placeholder: "subtitle" });
s.addText("Transformer Modeling and Sequence Learning  ·  Case Study Topic 2", { placeholder: "tagline" });
s.addNotes("Research question: how do recurrent networks and Transformers compare at classifying short news texts. Both models built from first principles - no nn.LSTM, no nn.MultiheadAttention. The short answer is that they tie, and the interesting part is why.");

pres.addSection({ title: "Setup" });

// 2 — the question
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Setup" });
s.addText("The question, and why AG News answers it well", { placeholder: "title" });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: W - 2 * M, h: 1.0, rectRadius: 0.08,
  fill: { color: NAVY }, line: { width: 0 }, objectName: "rq-banner" });
tx(s, "How do recurrent networks and Transformers compare at classifying short news texts?",
  { x: M + 0.3, y: 1.35, w: W - 2 * M - 0.6, h: 1.0, fontSize: 19, bold: true, color: "FFFFFF",
    italic: true, valign: "middle", fontFace: "Cambria" });
badgeRow(s, 1, M, 2.7, 3.9, "Four classes, not two",
  "World, Sports, Business, Sci/Tech. Twelve off-diagonal confusion cells show how a model fails, not just how often.", BLUE);
badgeRow(s, 2, M + 4.1, 2.7, 3.9, "Genuinely short text",
  "Median 39 tokens. This is exactly the regime where attention's long-range advantage is weakest.", ORANGE);
badgeRow(s, 3, M + 8.2, 2.7, 3.9, "A standard benchmark",
  "Published results span roughly 88-95%, so the result can be situated against prior work.", GREEN);
statCard(s, M, 4.55, 2.75, 1.95, "120k", "Training articles", "60,000 sampled for the controlled run", BLUE);
statCard(s, M + 2.95, 4.55, 2.75, 1.95, "7,600", "Test articles", "Official split, used once", NAVY);
statCard(s, M + 5.9, 4.55, 2.75, 1.95, "4", "Classes", "Exactly balanced, 1,900 each", GREEN);
statCard(s, M + 8.85, 4.55, 2.75, 1.95, "39", "Median tokens", "The number that explains the result", ORANGE);
s.addNotes("AG News is a good vehicle for this question for three reasons. Four classes give a rich confusion structure. The documents are short, which is the regime where the comparison is most informative. And it is a standard benchmark so we can situate the result.");

// 3 — controlled design
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Setup" });
s.addText("A controlled experiment: architecture is the only variable", { placeholder: "title" });
card(s, M, 1.35, 2.85, 2.1, "1. Same data",
  "One stratified 60k subset, one split, one seed. Both models see identical records in identical order.", BLUE);
card(s, M + 3.05, 1.35, 2.85, 2.1, "2. Same preprocessing",
  "One tokeniser, one vocabulary built on train only, one max length. The same tensors, not merely equivalent ones.", ORANGE);
card(s, M + 6.1, 1.35, 2.85, 2.1, "3. Same capacity",
  "265,220 vs 265,732 non-embedding parameters - a difference of 0.19%.", GREEN);
card(s, M + 9.15, 1.35, 2.85, 2.1, "4. Same budget",
  "Identical batch size, epoch cap, optimiser, weight decay, clipping, early stopping and seed.", "6250D6");
s.addTable([
  [{ text: "Split", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Records", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Per class", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Purpose", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["Training", "54,000", "13,500", "Parameter estimation"],
  ["Validation", "6,000", "1,500", "Early stopping and learning-rate choice"],
  ["Test (official)", "7,600", "1,900", "Final evaluation - used exactly once"],
], { x: M, y: 3.75, w: W - 2 * M, colW: [2.2, 1.6, 1.6, 6.5], fontSize: 13, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.38, valign: "middle",
     fill: { color: "FFFFFF" } });
tx(s, "The one quantity not shared is the learning rate (1e-3 vs 3e-4), tuned per architecture on validation only. A single shared rate would look fairer but would handicap whichever model it suited less.",
  { x: M, y: 5.85, w: W - 2 * M, h: 0.7, fontSize: 12.5, color: MUTED, italic: true });
s.addNotes("Four controls: data, preprocessing, capacity, budget. The learning rate is the one thing tuned per model, on validation only - forcing a shared rate would measure sensitivity to that rate rather than the architectures.");

pres.addSection({ title: "Models" });

// 4 — BiLSTM
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Models" });
s.addText("Model A — bidirectional LSTM, written by hand", { placeholder: "title" });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: 6.1, h: 2.75, rectRadius: 0.08,
  fill: { color: PALE }, line: { width: 0 }, objectName: "eq-card" });
tx(s, "The four gates, in one fused matmul", { x: M + 0.25, y: 1.5, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: BLUE });
tx(s, "i_t = sigmoid(W_i x_t + U_i h_prev + b_i)   input\n" +
      "f_t = sigmoid(W_f x_t + U_f h_prev + b_f)   forget\n" +
      "g_t = tanh   (W_g x_t + U_g h_prev + b_g)   candidate\n" +
      "o_t = sigmoid(W_o x_t + U_o h_prev + b_o)   output\n\n" +
      "c_t = f_t (*) c_prev + i_t (*) g_t\n" +
      "h_t = o_t (*) tanh(c_t)\n\n" +
      "(*) = elementwise product",
  { x: M + 0.25, y: 1.88, w: 5.6, h: 2.2, fontSize: 11.5, color: NAVY, fontFace: "Courier New", lineSpacingMultiple: 1.14, isTextBox: true, margin: 0 });
badgeRow(s, 1, M + 6.5, 1.45, 5.4, "Padding must not corrupt the state",
  "Each step is gated by the mask, h ← m·h_new + (1−m)·h_prev, so a padded step is an exact no-op.", ORANGE);
badgeRow(s, 2, M + 6.5, 2.75, 5.4, "The backward pass starts at the true end",
  "Padding sits at the right and masked steps are no-ops, so iterating t = T−1…0 begins at each sequence's own last real token.", ORANGE);
tx(s, "Neither defect raises an error. Both simply make the model quietly worse — which is why slide 7 exists.",
  { x: M + 6.5, y: 4.15, w: 5.4, h: 0.6, fontSize: 12, color: MUTED, italic: true });
card(s, M, 4.35, 6.1, 1.9, "Pooling",
  "Masked mean over all timesteps, concatenated with the final state of each direction (4H features). The mean alone discards the endpoint the recurrence built; the endpoint alone is noisy at 39 tokens.", BLUE);
card(s, M + 6.5, 4.75, 5.4, 1.55, "Configuration",
  "128-dim embedding  \u00B7  128 hidden units  \u00B7  bidirectional  \u00B7  dropout 0.30\n\n265,220 non-embedding parameters, matched to the Transformer within 0.19%.", BLUE);
s.addNotes("The LSTM cell is written out: four gates, fused into one matmul, split with chunk. Gate order i-f-g-o deliberately matches PyTorch so the verification can copy nn.LSTM weights across. The two masking details are the classic silent-failure points.");

// 5 — Transformer
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Models" });
s.addText("Model B — Transformer encoder, written by hand", { placeholder: "title" });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: 6.1, h: 1.75, rectRadius: 0.08,
  fill: { color: PALE }, line: { width: 0 }, objectName: "attn-card" });
tx(s, "Scaled dot-product attention", { x: M + 0.25, y: 1.5, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: ORANGE });
tx(s, "Attention(Q, K, V) = softmax( QKᵀ / √dₖ + M ) V",
  { x: M + 0.25, y: 1.95, w: 5.6, h: 0.45, fontSize: 16, color: NAVY, fontFace: "Courier New", isTextBox: true, margin: 0 });
tx(s, "The √dₖ scaling keeps the softmax out of saturation: dot products of unit-variance vectors have variance dₖ.",
  { x: M + 0.25, y: 2.45, w: 5.6, h: 0.55, fontSize: 11.5, color: MUTED, isTextBox: true, margin: 0 });
card(s, M, 3.3, 2.95, 1.5, "Multi-head", "Project once at full width, reshape into 4 heads. The reshape is the most error-prone step.", ORANGE);
card(s, M + 3.15, 3.3, 2.95, 1.5, "Positional encoding", "Sinusoidal. Without it, self-attention is permutation-invariant — a bag of words.", ORANGE);
card(s, M, 4.95, 2.95, 1.5, "Layer norm", "Hand-written, biased variance, to match the reference exactly.", ORANGE);
card(s, M + 3.15, 4.95, 2.95, 1.5, "Pre-norm block", "x + attn(norm(x)). Trains stably with no warmup schedule.", ORANGE);
badgeRow(s, 1, M + 6.5, 1.45, 5.4, "The mask is −1e9, never −∞",
  "A fully-masked row would softmax to NaN under −∞ and destroy the gradients of the whole batch.", BLUE);
badgeRow(s, 2, M + 6.5, 2.9, 5.4, "Capacity matched to the BiLSTM",
  "d_model 128, 4 heads, 2 layers, d_ff 256 — 265,732 non-embedding parameters, within 0.19% of Model A.", BLUE);
badgeRow(s, 3, M + 6.5, 4.35, 5.4, "Nothing borrowed from the library",
  "No nn.MultiheadAttention, no nn.TransformerEncoderLayer, no nn.LayerNorm, no F.scaled_dot_product_attention.", BLUE);
s.addNotes("Pre-norm encoder, four hand-written pieces: positional encoding, layer norm, multi-head attention with the head split and merge done by hand, and the residual block. The minus-1e9 mask constant rather than minus infinity is a real numerical detail, not pedantry.");

pres.addSection({ title: "Verification" });

// 6 — matched capacity (dark)
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Verification" });
s.addText("Matched capacity makes it an architecture comparison", { placeholder: "title" });
statCard(s, M, 1.8, 3.6, 2.2, "265,220", "BiLSTM", "non-embedding parameters", BLUE, true);
statCard(s, M + 3.9, 1.8, 3.6, 2.2, "265,732", "Transformer", "non-embedding parameters", ORANGE, true);
statCard(s, M + 7.8, 1.8, 3.9, 2.2, "0.19%", "Difference", "512 parameters out of ~265,000", GREEN, true);
tx(s, "Why the non-embedding figure is the one that matters",
  { x: M, y: 4.35, w: W - 2 * M, h: 0.4, fontSize: 17, bold: true, color: "FFFFFF", fontFace: "Cambria" });
tx(s, "The shared embedding table holds 4,347,392 parameters — about 94% of each model's 4.61M total. Quoting totals would make the two models look 0.01% apart, which is true but says nothing about architecture. Stripping the embeddings out leaves the parts that actually differ, and those are matched to within 512 parameters. No performance difference observed later can reasonably be attributed to model size.",
  { x: M, y: 4.85, w: W - 2 * M, h: 1.5, fontSize: 14, color: "CBD6E6", lineSpacingMultiple: 1.15, isTextBox: true, margin: 0 });
s.addNotes("This is the control that makes the comparison meaningful. The embedding table dominates both totals and is identical, so the honest measure is non-embedding parameters - matched to 0.19%.");

// 7 — verification
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Verification" });
s.addText("Proving the hand-written layers are actually correct", { placeholder: "title" });
tx(s, "A hand-written layer that is subtly wrong does not crash. It trains, converges, and reports an accuracy two or three points low — exactly the size of an “architectural finding”.",
  { x: M, y: 1.3, w: W - 2 * M, h: 0.6, fontSize: 14, color: NAVY, italic: true });
s.addTable([
  [{ text: "Check", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "What it rules out", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "Measured", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  ["LSTM cell vs nn.LSTM", "Wrong gate order or algebra, misplaced bias", "5.96e-08"],
  ["Layer norm vs reference", "Biased vs unbiased variance", "4.77e-07"],
  ["Attention vs per-head loop", "Wrong head split / merge reshape", "8.94e-08"],
  ["Attention rows sum to 1", "Softmax over the wrong axis", "1.79e-07"],
  ["Padded keys get no mass", "Mask never reaching the scores", "0.00e+00"],
  [{ text: "BiLSTM padding invariance", options: { bold: true } },
   { text: "Unmasked state, wrong backward start", options: { bold: true } },
   { text: "0.00e+00", options: { bold: true } }],
  [{ text: "Transformer padding invariance", options: { bold: true } },
   { text: "Padding leaking into pooling", options: { bold: true } },
   { text: "1.19e-07", options: { bold: true } }],
  ["Both models overfit 200 examples", "Dead gradients, broken backward path", "100%"],
], { x: M, y: 2.0, w: W - 2 * M, colW: [3.6, 5.6, 2.7], fontSize: 12.5, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.33, valign: "middle",
     fill: { color: "FFFFFF" } });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.6, w: W - 2 * M, h: 0.85, rectRadius: 0.08,
  fill: { color: "E6F6EF" }, line: { width: 0 }, objectName: "pass-banner" });
tx(s, "All 9 checks pass, and they run before training on every execution — the suite asserts, so results cannot be produced from an unverified implementation.",
  { x: M + 0.3, y: 5.6, w: W - 2 * M - 0.6, h: 0.85, fontSize: 13.5, bold: true, color: "0E6B4A", valign: "middle" });
s.addNotes("This is the slide that licenses everything after it. Padding invariance - checks 6 and 7 - is the decisive one, because the masking bugs it catches produce no error at all, only a quietly worse model.");

pres.addSection({ title: "Results" });

// 8 — training dynamics
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("Both models overfit fast — early stopping did the work", { placeholder: "title" });
s.addImage({ path: "fig3_learning_curves.png", x: M, y: 1.4, w: 8.5, h: 2.9 });
card(s, M + 8.8, 1.4, 3.1, 2.9, "What the curves show",
  "Training loss keeps falling while validation loss climbs from epoch 2 in both models.\n\nThe BiLSTM peaked after a single epoch; the Transformer at epoch 3.\n\nThe 8-epoch cap was never the binding constraint.", BLUE);
statCard(s, M, 4.6, 2.75, 1.85, "1", "BiLSTM best epoch", "of 3 run before stopping", BLUE);
statCard(s, M + 2.95, 4.6, 2.75, 1.85, "3", "Transformer best epoch", "of 5 run before stopping", ORANGE);
statCard(s, M + 5.9, 4.6, 2.75, 1.85, "0.9091", "Best val macro-F1", "BiLSTM", BLUE);
statCard(s, M + 8.85, 4.6, 2.75, 1.85, "0.9077", "Best val macro-F1", "Transformer", ORANGE);
s.addNotes("Worth being upfront: the recurrent model's effective budget was one epoch. Early stopping caught it and restored the right checkpoint, but both models consume 54,000 records very quickly at this capacity.");

// 9 — headline (dark)
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Results" });
s.addText("Headline result on the held-out test set", { placeholder: "title" });
statCard(s, M, 1.7, 3.75, 2.3, "91.14%", "BiLSTM", "macro-F1 0.9111", BLUE, true);
statCard(s, M + 4.05, 1.7, 3.75, 2.3, "91.05%", "Transformer", "macro-F1 0.9104", ORANGE, true);
statCard(s, M + 8.1, 1.7, 3.8, 2.3, "0.09 pp", "The gap", "seven documents out of 7,600", "FFFFFF", true);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.35, w: W - 2 * M, h: 1.9, rectRadius: 0.1,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "warn-card" });
tx(s, "Do not interpret this difference yet", { x: M + 0.4, y: 4.55, w: W - 2 * M - 0.8, h: 0.4,
  fontSize: 19, bold: true, color: ORANGE, fontFace: "Cambria" });
tx(s, "Both models land in the 90–92% band the literature predicts for a from-scratch model without pretraining. The BiLSTM is nominally ahead on every metric except test loss — by seven documents. Whether that is a result or sampling noise is a question a significance test answers, and it is the next slide.",
  { x: M + 0.4, y: 5.0, w: W - 2 * M - 0.8, h: 1.1, fontSize: 14, color: "CBD6E6",
    lineSpacingMultiple: 1.12, isTextBox: true, margin: 0 });
s.addNotes("Both in the expected band. The BiLSTM is nominally ahead by 0.09 points, which is seven documents. The temptation is to call that a win. Do not.");

// 10 — significance (the key slide)
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("Is the difference real? McNemar's test says no", { placeholder: "title" });
s.addTable([
  [{ text: "", options: { fill: { color: "FFFFFF" } } },
   { text: "BiLSTM correct", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } },
   { text: "BiLSTM wrong", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }],
  [{ text: "Transformer correct", options: { bold: true, fill: { color: PALE } } },
   { text: "6,740", options: { align: "center" } },
   { text: "180", options: { align: "center", bold: true, color: ORANGE } }],
  [{ text: "Transformer wrong", options: { bold: true, fill: { color: PALE } } },
   { text: "187", options: { align: "center", bold: true, color: BLUE } },
   { text: "493", options: { align: "center" } }],
], { x: M, y: 1.5, w: 6.3, colW: [2.3, 2.0, 2.0], fontSize: 14, color: NAVY,
     border: { type: "solid", color: "D8E0EA", pt: 1 }, rowH: 0.52, valign: "middle",
     fill: { color: "FFFFFF" } });
tx(s, "Only the discordant cells carry information. The agreements — 6,740 and 493 — say nothing about which model is better and are discarded.",
  { x: M, y: 3.35, w: 6.3, h: 0.7, fontSize: 12.5, color: MUTED, italic: true });
statCard(s, M + 6.7, 1.5, 2.5, 1.75, "187", "Only BiLSTM", "correct", BLUE);
statCard(s, M + 9.4, 1.5, 2.5, 1.75, "180", "Only Transformer", "correct", ORANGE);
statCard(s, M + 6.7, 3.45, 5.2, 1.6, "p = 0.754", "McNemar exact binomial", "not significant at α = 0.05", NAVY);
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.3, w: 6.3, h: 2.0, rectRadius: 0.08,
  fill: { color: NAVY }, line: { width: 0 }, objectName: "verdict" });
tx(s, "The architectures are indistinguishable", { x: M + 0.3, y: 4.5, w: 5.7, h: 0.4,
  fontSize: 17, bold: true, color: "FFFFFF", fontFace: "Cambria" });
tx(s, "A 187-to-180 split is as close to a coin flip as a 7,600-document test set can resolve. The two models also agree on 94.78% of individual predictions.\n\nThe correct conclusion is equivalence — not that the BiLSTM won.",
  { x: M + 0.3, y: 4.95, w: 5.7, h: 1.2, fontSize: 13, color: "CBD6E6", lineSpacingMultiple: 1.1, isTextBox: true, margin: 0 });
tx(s, "This test cost a few lines of code and reversed the qualitative conclusion of the whole study.",
  { x: M + 6.7, y: 5.3, w: 5.2, h: 1.0, fontSize: 13, color: NAVY, bold: true, italic: true });
s.addNotes("This is the central result. McNemar looks only at the documents exactly one model gets right: 187 versus 180, p equals 0.754. Not significant. Reporting a winner from a 0.09 point gap would have been wrong, and the test is what prevents it.");

// 11 — per class + confusion
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("They do not just tie — they fail in the same way", { placeholder: "title" });
s.addImage({ path: "fig1_per_class_f1.png", x: M, y: 1.30, w: 5.3, h: 2.61 });
s.addImage({ path: "fig2_confusion_matrices.png", x: M, y: 4.05, w: 5.3, h: 2.45 });
badgeRow(s, 1, M + 5.8, 1.40, 6.1, "Identical difficulty ordering",
  "Sports (≈0.96) > World (≈0.91) > Sci/Tech (≈0.89) > Business (≈0.878), for both models.", BLUE);
badgeRow(s, 2, M + 5.8, 2.75, 6.1, "Agreement to four decimal places",
  "On the hardest class, Business, the two models score 0.8777 and 0.8780.", ORANGE);
badgeRow(s, 3, M + 5.8, 4.10, 6.1, "The same dominant error",
  "Business predicted as Sci/Tech: 9.2% and 9.6%. That boundary accounts for about a quarter of all errors.", GREEN);
card(s, M + 5.8, 5.40, 6.1, 1.4, "Why that boundary is irreducible",
  "A semiconductor firm's quarterly earnings story is legitimately Business and legitimately Sci/Tech. The corpus assigns one label. This caps what any architecture can reach.", NAVY);
s.addNotes("Two models with genuinely different inductive biases would differ somewhere in this profile. These do not. Both are limited by the same thing: documents whose gold label is one of several defensible choices.");

// 12 — cost (native chart)
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Results" });
s.addText("The cost result inverts the textbook expectation", { placeholder: "title" });
s.addChart(pres.ChartType.bar, [
  { name: "BiLSTM", labels: ["Training time per epoch"], values: [41.2] },
  { name: "Transformer", labels: ["Training time per epoch"], values: [68.6] },
], { x: M, y: 1.45, w: 6.5, h: 2.7, barDir: "col", chartColors: [BLUE, ORANGE],
     showTitle: false, showLegend: true, legendPos: "t", legendColor: NAVY, legendFontFace: "+mn-lt",
     showValue: true, dataLabelPosition: "outEnd", dataLabelColor: NAVY, dataLabelFontSize: 12,
     dataLabelFontFace: "+mn-lt", dataLabelFormatCode: '#,##0.0"s"',
     catAxisLabelColor: NAVY, valAxisLabelColor: MUTED,
     catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
     catAxisLabelFontSize: 12, valAxisLabelFontSize: 10, valAxisTitle: "seconds",
     showValAxisTitle: true, valAxisTitleColor: MUTED, valAxisTitleFontSize: 10,
     valAxisTitleFontFace: "+mn-lt",
     valGridLine: { color: "E3E7EE", size: 1 }, catGridLine: { style: "none" }, barGapWidthPct: 110 });
tx(s, "Inference is measured separately: 138 ms vs 335 ms per 1,000 documents. Seconds and milliseconds are deliberately not plotted on a shared axis.",
  { x: M, y: 4.30, w: 6.5, h: 0.75, fontSize: 11.5, color: MUTED });
statCard(s, M + 6.9, 1.4, 2.4, 1.45, "1.67×", "faster to train", "", BLUE);
statCard(s, M + 9.5, 1.4, 2.4, 1.45, "2.43×", "faster inference", "", BLUE);
tx(s, "…in favour of the recurrent model, at matched accuracy and matched capacity.",
  { x: M + 6.9, y: 3.0, w: 5.0, h: 0.5, fontSize: 13, bold: true, color: NAVY });
card(s, M + 6.9, 3.6, 5.0, 2.7, "Why this does not contradict the theory",
  "Attention's advantage is asymptotic: O(1) sequential depth against O(n), and it needs parallel hardware to cash in.\n\nNeither condition holds here. On 6 CPU threads there is little parallelism to exploit, and per-layer cost is O(n·d²) vs O(n²·d) — with n = 64 and d = 128 these are the same order, so attention does not even win on operation count.\n\nWhen neither parallelism nor arithmetic favours attention, constant factors decide.", ORANGE);
tx(s, "This is a finding about a regime, not about the architectures. The ordering should reverse on a GPU, and the recurrent model's disadvantage grows with sequence length.",
  { x: M, y: 5.1, w: 6.5, h: 1.2, fontSize: 13, color: NAVY, italic: true });
s.addNotes("I expected the Transformer to be faster and it was not. Rather than explain that away, the report analyses it: the parallelism argument is asymptotic, and at 64 tokens on CPU neither parallelism nor arithmetic favours attention.");

pres.addSection({ title: "Conclusion" });

// 13 — why
s = pres.addSlide({ masterName: "CONTENT_LIGHT", sectionTitle: "Conclusion" });
s.addText("Why they tie: there is no long range to model", { placeholder: "title" });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 1.35, w: 5.2, h: 2.3, rectRadius: 0.1,
  fill: { color: NAVY }, line: { width: 0 }, objectName: "median-card" });
tx(s, "39", { x: M, y: 1.5, w: 5.2, h: 1.1, fontSize: 60, bold: true, color: ORANGE,
  align: "center", fontFace: "Cambria" });
tx(s, "median tokens per document", { x: M, y: 2.6, w: 5.2, h: 0.35, fontSize: 15, bold: true,
  color: "FFFFFF", align: "center" });
tx(s, "A headline plus one sentence", { x: M, y: 2.98, w: 5.2, h: 0.35, fontSize: 12,
  color: "AEBCD1", align: "center" });
badgeRow(s, 1, M + 5.7, 1.45, 6.2, "Attention's advantage is about distance",
  "Self-attention gives an O(1) path between any two positions, against O(n) for recurrence. In a 39-token document there are almost no distant positions to connect.", ORANGE);
badgeRow(s, 2, M + 5.7, 2.95, 6.2, "The signal here is lexical, not structural",
  "“coach”, “Olympic”, “medal” identify a sports story regardless of their arrangement. A bidirectional LSTM captures that just as well.", BLUE);
badgeRow(s, 3, M + 5.7, 4.45, 6.2, "The literature corroborates it",
  "FastText averages word vectors and models no order at all — yet reaches ≈92.5% on AG News, at or above both models here.", GREEN);
card(s, M, 3.85, 5.2, 2.45, "The general form of the argument",
  "An architecture's advantage can only show up on a task that exercises the property it is good at.\n\nTransformers are superior at long-range dependency. AG News contains almost none. So the two architectures perform equivalently.\n\nThis is a statement about the task, not a limitation of the Transformer.", NAVY);
s.addNotes("This is the explanation that makes the negative result informative rather than just inconclusive. Median 39 tokens means there is nothing for the long-range mechanism to do. FastText corroborates it independently.");

// 14 — conclusion (dark)
s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Conclusion" });
s.addText("Conclusions, and what I would do next", { placeholder: "title" });
const findings = [
  ["1", "Statistically indistinguishable", "91.14% vs 91.05%, McNemar p = 0.754, 94.78% agreement.", BLUE],
  ["2", "Document length explains it", "Median 39 tokens leaves attention's long-range advantage nothing to act on.", ORANGE],
  ["3", "They fail identically", "Same difficulty ordering, same dominant Business/Sci-Tech confusion.", GREEN],
  ["4", "Cost inverted expectation", "The BiLSTM trained 1.67× faster — a statement about scale, not architecture.", "EDA100"],
];
findings.forEach((f, i) => {
  const x = M + (i % 2) * 6.1, y = 1.5 + Math.floor(i / 2) * 1.5;
  s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.42, h: 0.42, fill: { color: f[3] }, objectName: `f-${i}` });
  tx(s, f[0], { x, y, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  tx(s, f[1], { x: x + 0.6, y: y - 0.02, w: 5.3, h: 0.32, fontSize: 15, bold: true, color: "FFFFFF" });
  tx(s, f[2], { x: x + 0.6, y: y + 0.33, w: 5.3, h: 0.8, fontSize: 12.5, color: "AEBCD1", lineSpacingMultiple: 1.05 });
});
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.6, w: 5.9, h: 1.75, rectRadius: 0.08,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "limits" });
tx(s, "Principal limitation", { x: M + 0.3, y: 4.78, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: ORANGE });
tx(s, "A single seed per architecture. The 0.09-point gap sits inside typical seed variance — which is exactly why the claim made is “indistinguishable” and not a ranking in either direction.",
  { x: M + 0.3, y: 5.12, w: 5.3, h: 1.1, fontSize: 12.5, color: "CBD6E6", lineSpacingMultiple: 1.08, isTextBox: true, margin: 0 });
s.addShape(pres.ShapeType.roundRect, { x: M + 6.1, y: 4.6, w: 5.9, h: 1.75, rectRadius: 0.08,
  fill: { color: "1E3356" }, line: { width: 0 }, objectName: "next" });
tx(s, "Next steps", { x: M + 6.4, y: 4.78, w: 5.3, h: 0.3, fontSize: 14, bold: true, color: GREEN });
tx(s, "Multiple seeds for a confidence interval  ·  a sequence-length sweep to test the explanation directly  ·  repeat the timing on a GPU to test the predicted reversal.",
  { x: M + 6.4, y: 5.12, w: 5.3, h: 1.1, fontSize: 12.5, color: "CBD6E6", lineSpacingMultiple: 1.08, isTextBox: true, margin: 0 });
s.addNotes("Four findings. The most useful one is negative, and we only have it because a significance test was applied to a difference that looked like a result. The single-seed limitation is stated first because it is the honest bound on the claim.");

(async () => {
  await pres.writeFile({ fileName: "AG_News_BiLSTM_vs_Transformer.pptx" });
  await applyTheme("AG_News_BiLSTM_vs_Transformer.pptx", THEME);
  console.log("deck written");
})();
