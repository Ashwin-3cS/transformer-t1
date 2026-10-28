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

A from-scratch layer that is subtly wrong still trains and still reports a plausible accuracy — it
just quietly reports a worse one, which would invalidate the comparison. Section 5 therefore
asserts, as part of the deliverable:

- `LSTMCellScratch` matches `nn.LSTM` with weights copied across
- `LayerNormScratch` matches `F.layer_norm`
- `MultiHeadSelfAttentionScratch` matches a naive per-head reference loop
- attention rows sum to 1 and padded keys receive ~zero attention mass
- **padding invariance** — appending `<pad>` tokens does not move either model's logits
- both models can overfit 200 examples, proving the backward path is alive
