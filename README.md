# News Topic Classification on AG News — BiLSTM vs. Transformer, built from scratch

Case study for **Transformer Modeling and Sequence Learning** (Topic 2).

**Research question:** how do recurrent networks and Transformers compare at classifying short
news texts?

Two models are implemented from scratch and compared under a controlled experiment on AG News
(World / Sports / Business / Sci-Tech). PyTorch supplies tensors, autograd and the optimiser;
every sequence-modelling component is written by hand.

| Component | Implemented as |
|---|---|
| LSTM cell (input / forget / cell / output gates) | `LSTMCellScratch` |
| Recurrence over time + bidirectionality | `LSTMLayerScratch` |
| Scaled dot-product attention | `MultiHeadSelfAttentionScratch` |
| Multi-head split / merge projections | `MultiHeadSelfAttentionScratch` |
| Sinusoidal positional encoding | `sinusoidal_positional_encoding` |
| Layer normalisation | `LayerNormScratch` |
| Position-wise feed-forward + residual block | `EncoderBlockScratch` |

Not used anywhere in either model: `nn.LSTM`, `nn.GRU`, `nn.RNN`, `nn.MultiheadAttention`,
`nn.Transformer*`, `nn.LayerNorm`, `F.scaled_dot_product_attention`. `nn.LSTM` and `F.layer_norm`
appear once each in the correctness-test section, used purely as numerical references.

## Experimental design

The comparison is controlled rather than two unrelated training runs:

- **One stratified 60,000-record subset** of the 120,000-row training file (15,000 per class),
  split 54,000 train / 6,000 validation with a fixed seed.
- **The full official 7,600-record test set** held back for the final comparison.
- **One shared preprocessing pipeline** — same tokeniser, same vocabulary (built on the training
  split only), same `MAX_LEN`, same tensors into both models.
- **One shared training harness** — same batch size, epoch cap, optimiser family, weight decay,
  gradient clipping, early-stopping rule and seed.
- **Matched capacity** — both models carry ~265k non-embedding parameters, so the result is an
  architecture comparison and not a disguised parameter-count contest.

The only tuned-per-model quantity is the learning rate, selected on validation and never on test.

## Setup

```bash
uv venv .venv --python 3.14
uv pip install --python .venv/bin/python torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python -m ipykernel install --user --name laksh-agnews \
    --display-name "AG News (scratch models)"
```

Kaggle credentials — this project uses the newer `KGAT_` token format:

```bash
mkdir -p ~/.kaggle && echo KGAT_xxx > ~/.kaggle/access_token && chmod 600 ~/.kaggle/access_token
```

The notebook downloads `amananandrai/ag-news-classification-dataset` on first run and caches it in
`data/agnews/`. A legacy `~/.kaggle/kaggle.json` is also accepted.

## Running

Open `ag_news_rnn_vs_transformer.ipynb` with the `laksh-agnews` kernel, or execute headless:

```bash
MPLBACKEND=Agg .venv/bin/jupyter nbconvert --to notebook --execute --inplace \
    --ExecutePreprocessor.timeout=7200 ag_news_rnn_vs_transformer.ipynb
```

Set `SMOKE_TEST = True` in the configuration cell for a ~1 minute end-to-end check (2,000 records,
1 epoch) before committing to the full CPU run. Figures, checkpoints and `metrics.json` are written
to `artifacts/`.

## Notebook structure

| Section | Contents |
|---|---|
| 0 | Configuration, seeding, plot style |
| 1 | Kaggle download, text cleaning, label mapping |
| 2 | Controlled 60k subset, tokeniser, vocabulary, length analysis, tensors |
| 3 | Model A — bidirectional LSTM from scratch |
| 4 | Model B — Transformer encoder from scratch |
| 5 | Correctness tests for every hand-written layer |
| 6 | Shared training harness |
| 7 | Comparative evaluation |
| 8 | Conclusion and limitations |

## Correctness tests

### Why the notebook tests its own layers

A hand-written layer that is subtly wrong **still trains and still reports a plausible accuracy
number** — it just quietly reports a worse one. Transpose two LSTM gates and the model still
converges, a few points lower, with nothing in the output to say why. Get the attention head
reshape wrong and the heads silently mix. Forget to mask padding and the recurrence keeps running
on `<pad>` tokens.

None of those produce an error. All of them would invalidate the comparison while looking like a
result. So verification is part of the deliverable rather than scaffolding: notebook section 5
runs nine checks and **asserts** on failure, halting before any training happens.

`nn.LSTM` and `F.layer_norm` are imported **only in this section**, purely as numerical references.
Neither is used by either model.

### The nine checks

| # | Check | What it rules out | Measured |
|---|---|---|---|
| 1 | `LSTMCellScratch` vs `nn.LSTM`, weights copied across | wrong gate order, wrong gate algebra, misplaced bias | 5.96e-08 |
| 2 | `LayerNormScratch` vs `F.layer_norm` | biased vs unbiased variance, wrong reduction axis | 4.77e-07 |
| 3 | Attention vs a naive per-head loop | wrong head split/merge reshape, wrong √d_k scaling | 8.94e-08 |
| 4 | Attention rows sum to 1 | softmax over the wrong axis | 1.79e-07 |
| 5 | Padded keys receive ~zero attention mass | key-padding mask not reaching the scores | 0.00e+00 |
| 6 | **BiLSTM padding invariance** | unmasked recurrence state, wrong backward start | 0.00e+00 |
| 7 | **Transformer padding invariance** | padding leaking into the pooled representation | 1.19e-07 |
| 8 | BiLSTM overfits 200 examples | dead gradients, broken backward path | 100% / 30 steps |
| 9 | Transformer overfits 200 examples | dead gradients, broken backward path | 100% / 30 steps |

All nine pass. Tolerances are `1e-5` for equivalence checks, `1e-6` for layer norm, `1e-4` for
padding invariance.

### How three of them are designed, and why it matters

**Check 1 is an equivalence test, not a similarity test.** It copies `nn.LSTM`'s `weight_ih_l0`,
`weight_hh_l0` and the *sum* of its two bias vectors into the hand-written cell, runs both over the
same input, and demands agreement to 1e-7 on every timestep and on the final state. That pins down
the exact gate algebra. Checking only that "the outputs look similar" would pass a model with the
input and forget gates transposed.

**Check 3 uses an independent formulation rather than a rewrite.** The reference recomputes
attention one `(batch, head)` pair at a time, slicing head columns explicitly with
`q[b, :, h*d_k:(h+1)*d_k]`. Comparing the vectorised `view`/`transpose` head split against explicit
column slices is what actually verifies the reshape. An `einsum` reference would have shared the
exact assumption under test and proved nothing.

**Checks 6 and 7 are the decisive ones.** Appending extra `<pad>` tokens to a batch must not move
either model's logits by more than float noise. This is the single most effective guard against the
two masking bugs the models are most likely to have — and those bugs are invisible by any other
means, because they produce no error, only a quietly worse model. The BiLSTM is exact (0.00e+00);
the Transformer is at float precision (1.19e-07).

Checks 8 and 9 are the complement: a model that cannot drive 200 examples to 100% training accuracy
in 30 steps has a broken backward path, regardless of how correct its forward pass looks.

### Running them alone

The checks live in notebook section 5 and run on every execution, before training. For a fast pass
over just the layer logic, set `SMOKE_TEST = True` and execute to section 5 — the checks use
synthetic tensors and do not depend on the dataset size.

## Results

See **[RESULTS.md](RESULTS.md)** for the full write-up of the process and findings.

Headline, on the full 7,600-record official test set:

| Model | Test accuracy | Macro F1 | Non-embedding params | Sec / epoch |
|---|---|---|---|---|
| BiLSTM | 0.9114 | 0.9111 | 265,220 | 41.2 |
| Transformer | 0.9105 | 0.9104 | 265,732 | 68.6 |

The 0.09pp gap is **not statistically significant** — McNemar exact test *p* = 0.754, with the two
models agreeing on 94.78% of test documents. The honest conclusion is that the architectures are
indistinguishable in accuracy on this task; both also share the same dominant error
(Business ↔ Sci/Tech) and the same per-class difficulty ordering.

At `MAX_LEN = 64` on CPU the BiLSTM trains **1.67× faster**, which inverts the usual expectation.
RESULTS.md §6 explains why that is a statement about sequence length and hardware rather than about
the architectures.
