---
layout: page
title: Walkthroughs
icon: fas fa-terminal
order: 3
permalink: /walkthroughs/
---

[Skip to full walkthrough index ↓](#all-walkthroughs)

## Hands‑On Walkthroughs 

These walkthroughs demonstrate how I apply **Process‑First Data Strategy**, **operating‑model clarity**, and **decision intelligence** in real technical work.  
They’re practical, high‑signal examples of how I build SQL models, Power BI semantic layers, governance structures, and analytics workflows that scale.

Each walkthrough is designed to be:
- **actionable**  
- **clear**  
- **adaptable to your environment**  
- **aligned with real business processes**  

---

## SQL Walkthroughs

### **Modeling Patterns**
Practical examples of how to structure SQL models for clarity, maintainability, and performance.

- Dimensional modeling patterns  
- CTE‑driven transformations  
- Process‑aligned fact table design  
- Handling slowly changing dimensions  
- Designing stable date tables  

**Explore →** [/walkthroughs/sql-modeling-patterns/](/walkthroughs/sql-modeling-patterns/)

---

### **Performance & Optimization**
Walkthroughs focused on diagnosing and improving query performance.

- Indexing strategies  
- Query plan interpretation  
- Reducing scans and hotspots  
- Refactoring inefficient joins  
- Improving incremental refresh pipelines  

**Explore →** *(coming soon)*

---

## Power BI Walkthroughs

### **Modeling & Semantic Layer Design**
Examples of how to build Power BI models that reflect real business processes and support decision‑making.

- Star schema modeling  
- Semantic layer patterns  
- Relationship design  
- Calculation groups  
- Process‑aligned measures  

**Explore →** *(coming soon)*

---

### **Governance & Workspace Strategy**
Walkthroughs that show how to scale Power BI across teams with clarity and consistency.

- Workspace design  
- Deployment pipelines  
- Dataflow patterns  
- Governance frameworks  
- Access & security models  

**Explore →** *(coming soon)*

---

## Decision‑Support Workflows

Walkthroughs that connect analytics work directly to the decisions it supports.

- Mapping decisions to data sources  
- Designing decision pathways  
- Building decision‑ready metrics  
- Creating feedback loops in reports  
- Aligning analytics outputs to business processes  

**Explore →** *(coming soon)*

---

## All Walkthroughs

{% assign pages = site.walkthroughs | sort: "title" %}
<ul>
{% for p in pages %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
{% endfor %}
</ul>

---

## How to Use These Walkthroughs

These walkthroughs are meant to help you:
- improve your modeling clarity  
- build scalable analytics workflows  
- align technical work to business processes  
- strengthen your team’s decision‑making capabilities  
- apply Process‑First thinking in real systems  

More walkthroughs will be added over time as I continue documenting the patterns I use in practice.

---

## Coming Soon

- SQL modeling patterns (full examples)  
- Power BI semantic layer walkthroughs  
- Governance & workspace strategy guides  
- Decision‑support workflow examples  
- End‑to‑end Process‑First modeling walkthroughs
