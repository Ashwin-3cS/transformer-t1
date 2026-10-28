# Results — AG News topic classification with from-scratch sequence models

Full account of the experiment: what was run, how it was verified, what came out, and what it
does and does not support. Every number here is reproduced by executing
`ag_news_rnn_vs_transformer.ipynb` end to end; the machine-readable copy is `artifacts/metrics.json`.

**Research question.** How do recurrent networks and Transformers compare at classifying short
news texts?

**One-line answer.** On AG News they are statistically indistinguishable in accuracy
(91.14% vs 91.05%, McNemar *p* = 0.754), they fail on the same class boundary, and at this
sequence length the recurrent model is the *cheaper* of the two to train — the reverse of the
usual expectation, for reasons that are about scale rather than architecture.

---

## 1. Experimental setup

### 1.1 Environment

| | |
|---|---|
| Hardware | CPU only — 12 logical cores, 6 torch threads, 15 GB RAM, no CUDA |
| Python | 3.14.8 |
| PyTorch | 2.15.0+cpu |
| Seed | 42, applied to `random`, `numpy` and `torch` before every run |

CPU-only execution is not incidental: it shapes the cost findings in §6, and the interpretation
there is explicit about which conclusions are hardware-dependent.

### 1.2 Data

Source: Kaggle `amananandrai/ag-news-classification-dataset` — the standard AG News release,
120,000 training and 7,600 test articles over four balanced topics.

Each record is a `Title` and a `Description`, joined as `"{title}. {description}"`.

**One cleaning step was necessary.** The raw CSVs carry literal escape artefacts from the original
scrape — `"Reuters - Short-sellers, Wall Street's dwindling\band of ultra-cynics"`. Left in place,
the tokeniser reads `\band` as one token and welds two real words into a junk type that appears
nowhere else in the vocabulary. The sequence `\<letter>` is stripped before tokenising.

### 1.3 The controlled subset

The brief calls for roughly 60,000 records in a controlled experiment. Implemented as:

| Split | Records | Source |
|---|---|---|
| Train | 54,000 | stratified 60k subset of `train.csv`, 15,000 per class |
| Validation | 6,000 | stratified 10% of that subset |
| **Test** | **7,600** | the **full official `test.csv`**, untouched |

All three splits are exactly balanced at 1,900 records per class in test and 13,500 / 1,500 per
class in train / validation. Test data was used exactly once, for the final numbers in §5.

### 1.4 Preprocessing

| Setting | Value | Rationale |
|---|---|---|
| Tokeniser | `re.findall(r"[a-z0-9']+", text.lower())` | deliberately simple — both models get identical tokens, so tokeniser sophistication cannot favour either |
| Vocabulary | 33,964 types, `min_freq = 2` | built on the **training split only**; no validation or test text contributes |
| `MAX_LEN` | 64 tokens | chosen against the measured distribution, not guessed |

Measured token lengths on the training split: **median 39, mean 39.4, p95 58, max 181**. At
`MAX_LEN = 64`, **96.94%** of training documents are not truncated.

That median of 39 tokens is the single most important number in this report. It is the reason the
two architectures land in the same place, and §7 returns to it.

### 1.5 What makes the comparison controlled

Four things are held fixed, so the only free variable is the architecture:

1. **One subset and one split**, fixed seed.
2. **One preprocessing pipeline** — same tokeniser, same vocabulary, same `MAX_LEN`, the same
   integer tensors fed to both models.
3. **One training harness** — same batch size (128), epoch cap (8), optimiser family (AdamW),
   weight decay (0.01), gradient clipping (1.0), early-stopping rule and seed.
4. **Matched capacity** — 265,220 vs 265,732 non-embedding parameters, a difference of 0.19%.

The one quantity tuned per architecture is the learning rate (1e-3 BiLSTM, 3e-4 Transformer),
selected on validation and never on test. This is a deliberate choice: a single shared learning
rate would *look* fairer, but would handicap whichever architecture it suited less and would
measure sensitivity to that particular rate rather than the architectures themselves. The
controlled quantity is the compute budget.

---

## 2. The two models

Both are written from scratch. PyTorch supplies tensors, autograd and the optimiser; `nn.Linear`,
`nn.Embedding` and `nn.Dropout` are used only as parameter containers.

**Not used in either model:** `nn.LSTM`, `nn.GRU`, `nn.RNN`, `nn.MultiheadAttention`,
`nn.Transformer*`, `nn.LayerNorm`, `F.scaled_dot_product_attention`.

### 2.1 Model A — bidirectional LSTM

Three layers of abstraction:

**`LSTMCellScratch`** — one timestep, four gates in a single fused matmul split with `chunk(4)`:

```
i_t = σ(W_i x_t + U_i h_{t-1} + b_i)        input gate
f_t = σ(W_f x_t + U_f h_{t-1} + b_f)        forget gate
g_t = tanh(W_g x_t + U_g h_{t-1} + b_g)     candidate cell
o_t = σ(W_o x_t + U_o h_{t-1} + b_o)        output gate
c_t = f_t ⊙ c_{t-1} + i_t ⊙ g_t
h_t = o_t ⊙ tanh(c_t)
```

Gate order `i, f, g, o` matches PyTorch's own convention, which is what allows the correctness
test in §4 to copy `nn.LSTM`'s weights straight across.

**`LSTMLayerScratch`** — the explicit Python loop over timesteps, in either direction. Two details
here are the usual source of silent accuracy loss, and both are handled explicitly:

- *Padding must not corrupt the state.* Every step gates its update by the mask,
  `h ← m·h_new + (1−m)·h_prev`, making a padded step an exact no-op. Without this, pad tokens keep
  driving the recurrence and the final state drifts away from the real end of the sentence.
- *The backward pass must start at each sequence's true end.* Because padding sits at the right and
  masked steps are no-ops, iterating `t = T−1 … 0` under the same masking is equivalent to starting
  at each sequence's own last real token.

**`BiLSTMClassifier`** — embedding (128) → forward + backward layers (128 hidden each) → pooling →
dropout (0.3) → linear head. Pooling concatenates the masked mean over all timesteps with the final
hidden state of each direction (`2H + H + H = 4H` features): the mean alone discards the endpoint
the recurrence worked to build, and the endpoint alone is noisy on documents this short.

### 2.2 Model B — Transformer encoder

A pre-norm encoder from four hand-written pieces:

- **`sinusoidal_positional_encoding`** — the original Vaswani formulation. Self-attention is
  permutation-invariant, so without this the model sees a bag of words.
- **`LayerNormScratch`** — normalises over the feature dimension with learned γ, β, using the
  biased variance so it matches `F.layer_norm` exactly.
- **`MultiHeadSelfAttentionScratch`** — `softmax(QKᵀ/√d_k + M)V`, with the head split and merge
  done by hand. The key-padding mask `M` is applied as `-1e9` rather than `-inf`: under `-inf` a
  fully masked row softmaxes to `NaN` and poisons the gradients.
- **`EncoderBlockScratch`** — pre-norm residuals, `x + attn(norm(x))` then `x + ffn(norm(x))`.
  Pre-norm is deliberate: it trains stably without a learning-rate warmup schedule, which matters
  when the budget is a handful of CPU epochs.

Config: `d_model = 128`, 4 heads, 2 layers, `d_ff = 256`, dropout 0.1, masked mean-pool → linear head.

### 2.3 Capacity

| Model | Total params | Embedding | **Non-embedding** |
|---|---|---|---|
| BiLSTM | 4,612,612 | 4,347,392 | **265,220** |
| Transformer | 4,613,124 | 4,347,392 | **265,732** |

The embedding table is identical in size for both and dominates each total, so the non-embedding
column is the honest measure of architectural capacity. The 0.19% difference means this is an
architecture comparison, not a disguised parameter-count contest.

---

## 3. Training protocol

Shared harness, identical budget: batch size 128, max 8 epochs, AdamW with weight decay 0.01,
gradient clipping at 1.0, early stopping on **validation macro-F1** with patience 2 and
best-checkpoint restore.

| | BiLSTM | Transformer |
|---|---|---|
| Learning rate | 1e-3 | 3e-4 |
| Epochs run | 3 (of 8) | 5 (of 8) |
| **Best epoch** | **1** | **3** |
| Best validation macro-F1 | 0.9091 | 0.9077 |
| Total training time | 126s | 353s |

**Both models overfit quickly, and the BiLSTM peaked after a single epoch.** Training loss keeps
falling while validation loss climbs from epoch 2 onward (see `artifacts/fig3_learning_curves.png`).
Early stopping caught this and restored the correct checkpoint in both cases, but it is worth
stating plainly: at this capacity, 54,000 records are consumed fast, and the BiLSTM's effective
budget was one epoch. The epoch cap of 8 was never the binding constraint for either model.

---

## 4. Correctness testing

A from-scratch layer that is subtly wrong still trains and still reports a plausible accuracy
number — it just quietly reports a *worse* one. That failure mode would invalidate the entire
comparison while looking like a result, so verification is part of the deliverable (notebook §5),
and the section asserts on failure rather than printing a warning.

`nn.LSTM` and `F.layer_norm` appear in the notebook **only here**, purely as numerical references.

| # | Check | Rules out | Measured |
|---|---|---|---|
| 1 | `LSTMCellScratch` vs `nn.LSTM`, weights copied across | wrong gate order, wrong gate algebra, misplaced bias | max abs diff **5.96e-08** (outputs), **4.47e-08** (final state) |
| 2 | `LayerNormScratch` vs `F.layer_norm` | biased vs unbiased variance, wrong reduction axis | max abs diff **4.77e-07** |
| 3 | Attention vs naive per-head loop | wrong head split/merge reshape, wrong `√d_k` scaling | max abs diff **8.94e-08** |
| 4 | Attention rows sum to 1 | softmax over the wrong axis | max abs dev **1.79e-07** |
| 5 | Padded keys receive ~zero mass | key-padding mask not applied | max mass **0.00e+00** |
| 6 | **BiLSTM padding invariance** | the two masking bugs in §2.1 | max abs diff **0.00e+00** |
| 7 | **Transformer padding invariance** | key-padding mask leaking into pooling | max abs diff **1.19e-07** |
| 8 | BiLSTM overfits 200 examples | dead gradients, broken backward path | **100%** in 30 steps |
| 9 | Transformer overfits 200 examples | dead gradients, broken backward path | **100%** in 30 steps |

**All 9 pass.**

Three of these deserve comment on *why* they are designed the way they are:

- **Check 1 is a weight-copy equivalence test, not a similarity test.** Copying `nn.LSTM`'s
  `weight_ih_l0`, `weight_hh_l0` and the *sum* of both bias vectors into the hand-written cell and
  demanding agreement to 1e-7 pins down the exact gate algebra. A model with, say, `i` and `f`
  transposed would train fine and score a few points lower, with nothing to indicate why.
- **Check 3 uses an independent formulation, not a rewrite of the same code.** The reference
  recomputes attention one `(batch, head)` pair at a time with explicit column slicing. Comparing
  the vectorised `view`/`transpose` head split against explicit slices is what actually verifies
  the reshape; an einsum reference would have shared the suspect assumption.
- **Checks 6 and 7 are the decisive ones.** Appending extra `<pad>` tokens to a batch must not move
  either model's logits. This is the single most effective guard against the masking bugs described
  in §2.1, because those bugs produce no error — only a quietly worse model. Both models are exact
  or near-exact to float precision.

---

## 5. Accuracy results

All figures on the **full official 7,600-record test set**, from each model's restored
best-validation checkpoint.

### 5.1 Headline

| Model | Test accuracy | Macro F1 | Weighted F1 | Test loss |
|---|---|---|---|---|
| **BiLSTM** | **0.9114** | **0.9111** | **0.9111** | **0.2797** |
| Transformer | 0.9105 | 0.9104 | 0.9104 | 0.2944 |

The gap is **0.09 percentage points** — seven test documents.

### 5.2 The gap is not statistically significant

Accuracy alone cannot say whether two models fail in the same way. McNemar's exact test looks only
at the **discordant** documents — those exactly one model gets right — and asks whether that split
is distinguishable from a coin flip.

| | BiLSTM correct | BiLSTM wrong |
|---|---|---|
| **Transformer correct** | 6,740 | 187 |
| **Transformer wrong** | 180 | 493 |

- Discordant documents: **367 of 7,600** (187 only-BiLSTM, 180 only-Transformer)
- **McNemar exact binomial: *p* = 0.754**
- **Not significant at α = 0.05**
- Model agreement: **94.78%**

A 187 / 180 split is as close to a coin flip as this test set can resolve. **The correct
conclusion is that the two architectures are indistinguishable in accuracy on this task** — not
that the BiLSTM is marginally better. Without this test, a 0.09pp gap invites exactly that
over-reading.

### 5.3 Per-class

| Class | BiLSTM P | BiLSTM R | **BiLSTM F1** | Transformer P | Transformer R | **Transformer F1** |
|---|---|---|---|---|---|---|
| World | 0.9366 | 0.8789 | 0.9069 | 0.9227 | 0.9053 | **0.9139** |
| Sports | 0.9459 | 0.9853 | **0.9652** | 0.9553 | 0.9674 | 0.9613 |
| Business | 0.8850 | 0.8705 | 0.8777 | 0.8889 | 0.8674 | **0.8780** |
| Sci/Tech | 0.8791 | 0.9111 | **0.8948** | 0.8754 | 0.9021 | 0.8885 |

The ordering is identical for both models: Sports easiest (~0.96), Business hardest (~0.878). The
two architectures do not merely score the same overall — they have the *same difficulty profile*.

### 5.4 Confusion

Row-normalised, percentage of each true class (`artifacts/fig2_confusion_matrices.png`).

**BiLSTM**

| true ↓ / pred → | World | Sports | Business | Sci/Tech |
|---|---|---|---|---|
| World | **87.9%** (1670) | 3.7% (71) | 5.4% (103) | 2.9% (56) |
| Sports | 0.5% (9) | **98.5%** (1872) | 0.6% (11) | 0.4% (8) |
| Business | 3.1% (58) | 0.7% (14) | **87.1%** (1654) | **9.2%** (174) |
| Sci/Tech | 2.4% (46) | 1.2% (22) | 5.3% (101) | **91.1%** (1731) |

**Transformer**

| true ↓ / pred → | World | Sports | Business | Sci/Tech |
|---|---|---|---|---|
| World | **90.5%** (1720) | 2.6% (49) | 4.1% (77) | 2.8% (54) |
| Sports | 1.4% (27) | **96.7%** (1838) | 1.5% (28) | 0.4% (7) |
| Business | 2.9% (55) | 0.7% (14) | **86.7%** (1648) | **9.6%** (183) |
| Sci/Tech | 3.3% (62) | 1.2% (23) | 5.3% (101) | **90.2%** (1714) |

**The largest off-diagonal cell is Business → Sci/Tech for both models** (9.2% and 9.6%), and the
reverse direction is the third largest. This is a property of the task, not of either architecture:
a story about a semiconductor firm's quarterly earnings is legitimately both Business and Sci/Tech,
and AG News assigns it one label. This boundary caps what any model can reach here, and it is why
four-class AG News is a more informative benchmark than binary sentiment — the residual error is
interpretable.

---

## 6. Computational cost

| | BiLSTM | Transformer |
|---|---|---|
| Non-embedding params | 265,220 | 265,732 |
| Epochs run | 3 | 5 |
| **Seconds / epoch** | **41.2** | **68.6** |
| Total training | 126s | 353s |
| **Inference, ms / 1,000 docs** | **138** | 335 |

**The Transformer is 1.67× slower per epoch and 2.43× slower at inference.**

This is the opposite of the textbook expectation, and the reason is worth stating precisely rather
than explaining away.

The standard argument is that a recurrent model's `MAX_LEN` cell steps are *strictly sequential* —
every timestep waits on the previous one — whereas attention evaluates all positions in a few
batched matmuls. That argument is correct, and it is an argument about **asymptotics**: recurrent
cost grows linearly in sequence length and cannot be parallelised away, while attention trades that
for more total arithmetic that hardware can parallelise.

At `MAX_LEN = 64` on 6 CPU threads, the two effects are of comparable magnitude, and the constant
factors decide the wall clock:

- The Transformer does **more total arithmetic** per document — two encoder blocks of 4-head
  attention plus a 256-wide feed-forward, over all 64 positions.
- The BiLSTM pays **64 sequential dispatches** per direction, but each is a small fused matmul on a
  128-wide batch.

On short sequences and without a GPU, the first cost outweighs the second. **The architectural
advantage that makes Transformers dominant is real but mostly outside this regime** — it appears at
long sequence lengths and on massively parallel hardware, neither of which a 39-token headline on
CPU provides. Extrapolating this 1.67× to "RNNs are faster than Transformers" would be wrong; so
would quoting the textbook claim against the measurement.

---

## 7. Answering the research question

> *How do recurrent networks and Transformers compare at classifying short news texts?*

**1. They are indistinguishable in accuracy.** 91.14% vs 91.05%, McNemar *p* = 0.754, 94.78%
agreement. Neither architecture has an edge on this task that this test set can resolve.

**2. The reason is the word "short".** AG News documents are a headline plus a one-sentence blurb —
median **39 tokens**. Self-attention's structural advantage is modelling dependencies between
distant positions at constant path length, and in a 39-token document there are barely any distant
positions to connect. Topic signal here is carried largely by lexical evidence — *Reuters*,
*quarterly*, *coach*, *researchers* — which a bidirectional recurrence captures just as well. This
is the key qualification on any claim that Transformers simply beat RNNs at text classification:
**at this input length the architectural advantage has little to bite on.**

**3. They fail identically.** Same difficulty ordering across all four classes, same dominant
confusion (Business ↔ Sci/Tech), 94.78% agreement on individual predictions. The residual error is
a property of the labelling, not of either model.

**4. Cost is where they actually differ**, and that difference is a statement about scale. At
`MAX_LEN = 64` on CPU the BiLSTM trains 1.67× faster; the parallelism advantage that reverses this
is asymptotic in sequence length and hardware parallelism.

**Practical reading.** For short-text topic classification at this scale, choosing between these
two architectures on expected accuracy is not supported by the evidence. Choose on engineering
grounds — and measure, because on this workload the expected cost ordering was inverted.

---

## 8. Limitations

These bound what the numbers above support, and the first is the most important.

- **Single seed per architecture.** The 0.09pp accuracy gap is well within typical run-to-run seed
  variance, which is precisely why §5.2 reports a significance test rather than a winner. A claim
  that one architecture is genuinely better would need several seeds and a confidence interval.
  This experiment supports "indistinguishable", not a ranking.
- **Controlled 60k subset** of the 120k training file, per the brief. Both models would improve
  with the full set, and the more parameter-hungry Transformer likely more so — the accuracy
  comparison is specific to this data budget.
- **Both models overfit within a few epochs**, the BiLSTM after one. Stronger regularisation or a
  larger training set would change the training dynamics, though both already early-stop at a
  sensible checkpoint.
- **Randomly initialised embeddings, small 2-layer encoder.** This measures the architectures at
  matched capacity trained from scratch. It says nothing about pretrained Transformers, where
  transferred representations — not the architecture — are the dominant factor. A BERT-class model
  reaches ~94-95% on AG News, and that gap is about pretraining, not attention.
- **CPU-only timing.** Every cost figure in §6 is hardware-specific and would likely invert on a GPU.
- **`MAX_LEN = 64`** truncates 3.06% of training documents, affecting both models identically.

---

## 9. Reproducing

```bash
uv venv .venv --python 3.14
uv pip install --python .venv/bin/python torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python .venv/bin/python -r requirements.txt

mkdir -p ~/.kaggle && echo KGAT_xxx > ~/.kaggle/access_token && chmod 600 ~/.kaggle/access_token

MPLBACKEND=Agg .venv/bin/jupyter nbconvert --to notebook --execute --inplace \
    --ExecutePreprocessor.timeout=7200 ag_news_rnn_vs_transformer.ipynb
```

Runtime on the reference machine: ~9 minutes total (126s + 353s training, plus data download,
encoding and evaluation). Set `SMOKE_TEST = True` for a ~1 minute end-to-end check first.

Outputs land in `artifacts/`: `metrics.json`, both checkpoints, and four figures
(`fig0_token_lengths`, `fig1_per_class_f1`, `fig2_confusion_matrices`, `fig3_learning_curves`).
