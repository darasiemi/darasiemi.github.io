---
layout: page
title: Financial Analysis AI
# description: with background image
img: assets/img/system-architecture.png
importance: 1
category: personal
# related_publications: true
---

Financial Analysis AI is an end-to-end **LLM-powered application for analysing Nigerian companies' annual reports**. I built the project to improve my financial literacy and support more informed, evidence-based investment analysis. The initial implementation focuses on **MTN Nigeria, GTCO, and Zenith Bank**, with an architecture that can be extended to other companies listed on the Nigerian Exchange (NGX).

The system combines **RAG and agentic workflows** with keyword, semantic, and hybrid retrieval over PostgreSQL and pgvector. The agent can use specialised tools for **financial report search, table lookup, calculations, web search, and PowerPoint generation**. The project also incorporates LLMOps practices including evaluation, testing, deployment, cost and latency tracking, and monitoring and observability with Grafana.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/system-architecture.png" title="Financial Analysis AI system architecture" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    End-to-end architecture of the Financial Analysis AI system
</div>

[Project Repository](https://github.com/darasiemi/financial-analysis-AI-project)

[Launch App](https://dara-fin.streamlit.app/)
