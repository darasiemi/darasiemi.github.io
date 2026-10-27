---
layout: page
title: Tech Ireland National AI Challenge 2026 — Tus-Aite
img: assets/img/tus-aite-techireland-schematic.svg
importance: 2
category: hackathons
---

The TechIreland National AI Challenge 2026 ran under the theme **"AI & Agents: Strategy, Processes and Roles"**. Over two weeks, developers, entrepreneurs, researchers, students, and professionals worked together to solve real-world industry challenges using AI and agentic AI technologies across sectors from manufacturing to healthcare to public services.

**Tus-Aite** is our entry on the **healthcare** track. It targets the problem of outpatient waiting list prioritisation in the Irish health system: an AI agent that sits between a national waiting list and the clinician who signs each referral — ranking patients within their urgency category using objective clinical signals and ward-level capacity, and explaining every position in plain language.

<div class="row justify-content-sm-center">
    <div class="col-sm-10 mt-3 mt-md-0 schematic-scroll">
        {% include figure.liquid path="assets/img/tus-aite-techireland-schematic.svg" title="Tus-Aite agent architecture — waiting list to clinician" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

The waiting list is a synthetic set of Irish outpatient referrals, already sorted into **Urgent, Semi-Urgent, and Routine** per the NTPF national structure, with clinical detail and capacity invented for the challenge. The agent runs an **Urgency tool** (NEWS2 from latest vital signs), a **Capacity tool** (ward and clinic pressure), and a **Coordinator tool** that combines both scores, re-ranks within each category, and checks the five NTPF rules. The resulting **Ranked list** is saved with its evidence in the knowledge graph, and a **Rationale tool** explains each position from cited evidence. The clinician sees each position and its plain-language _why_, and can accept or override.

Code: [View on GitHub](https://github.com/NonsoCynthia/Tus-Aite-TechIreland-Challenge).
