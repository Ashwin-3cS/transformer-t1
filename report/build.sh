#!/usr/bin/env bash
# Build the report. Three passes resolve the TOC, cross-references and citations.
cd "$(dirname "$0")"
# Remove stale auxiliaries: a .toc from a previous build can pull in fonts
# that the current source no longer uses.
rm -f report.aux report.toc report.lof report.lot report.out

for i in 1 2 3; do
    pdflatex -interaction=nonstopmode report.tex > "build_pass$i.log" 2>&1 || true
done
if grep -qE '^! ' build_pass3.log; then
    echo "LaTeX errors:"; grep -E '^! ' build_pass3.log; exit 1
fi
cp report.pdf AG_News_BiLSTM_vs_Transformer_Report.pdf
echo "Built AG_News_BiLSTM_vs_Transformer_Report.pdf ($(pdfinfo report.pdf | awk '/Pages/{print $2}') pages)"
