#!/usr/bin/env bash
# Three passes resolve the TOC, cross-references and citations.
cd "$(dirname "$0")"
# Stale auxiliaries re-request fonts the current source no longer uses, which
# surfaces as an unrelated-looking font error. Always start clean.
rm -f report.aux report.toc report.lof report.lot report.out
for i in 1 2 3; do
    pdflatex -interaction=nonstopmode report.tex > "build_pass$i.log" 2>&1 || true
done
if grep -qE '^! ' build_pass3.log; then
    echo "LaTeX errors:"; grep -E '^! ' build_pass3.log; exit 1
fi
cp report.pdf Q_Learning_vs_SARSA_Warehouse_Report.pdf
echo "Built Q_Learning_vs_SARSA_Warehouse_Report.pdf ($(pdfinfo report.pdf | awk '/Pages/{print $2}') pages)"
