---
layout: page
title: FinHealth — Financial Behavioural Signals for Mood States
img: assets/img/finhealth-schematic.png
importance: 1
category: work
---

**FinHealth** is my PhD investigation into **whether everyday financial behaviour can serve as a passive signal for mood states in bipolar disorder**. The schematic below is the conceptual frame the investigation is built around: three mood states — **Depression**, **Balanced**, and **Hypomanic / manic** — mapped to **symptom-based features** that are each grounded in observable **financial behaviours**.

<div class="row justify-content-sm-center">
    <div class="col-sm-10 mt-3 mt-md-0 schematic-scroll">
        {% include figure.liquid path="assets/img/finhealth-schematic.png" title="FinHealth — mood states, symptom-based features, and financial behaviours" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

The diagram shows a non-exhaustive slice of the feature set: **Generosity** (gifts, donations to charity, transfers), **Goal pursuit** (multiple purchases of the same item), **Interest expression** (purchases in the same category), **Return pursuit** (risky investments, gambling, cryptocurrencies), and **Social performance** (purchases in particular categories). More symptom-based features are in scope beyond the five shown here.

Alongside the modelling work, I am developing the **data collection pipeline** that feeds it — a **Django** application wired to the **Plaid API** for open banking transactions. Folding self-report and clinical scale instruments into the same system, so behavioural signal and ground truth land together, is planned as future work.
