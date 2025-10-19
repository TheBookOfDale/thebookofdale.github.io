---
layout: page
title: "Start Here"
icon: fas fa-flag
order: 1
permalink: /start-here/
---

Welcome to **Leading with Data** — *The Data‑Driven Leader’s guide to building and empowering analytics teams with Microsoft technologies, governance, and enablement.*

Whether you’re a new manager stepping into analytics leadership for the first time, or a seasoned leader taking on a new team, this site is designed to help you build **clarity, consistency, and confidence**.

---

## 🎯 What You’ll Find Here
- **Practical walkthroughs**: SQL and Power BI examples you can adapt directly to your team’s work.  
- **Team enablement strategies**: How to set mission, vision, values, and goals that stick.  
- **Governance and scalability**: Frameworks for data quality, security, and sustainable growth.  
- **Leadership insights**: Lessons learned from leading analytics teams in complex environments.  

---

## 🚀 Where to Begin
{% assign series_posts = site.posts | where: "series", "team-enablement-branding" | sort: "date" %}
<ul>
  {% for post in series_posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <span class="post-date">({{ post.date | date: "%b %d, %Y" }})</span>
    </li>
  {% endfor %}
</ul>
<!-- 1. **[Manufacturing Analytics Foundations Series](/series/manufacturing-analytics-foundations/)**  
   Learn how to design realistic hierarchies, build reusable date tables, and create polished Power BI reports.  

2. **[Defining Your Team’s Mission, Vision, and Values](/posts/team-mvv/)**  
   A practical guide to aligning your analytics team’s purpose with organizational strategy.  

3. **[Data Governance for Leaders](/posts/data-governance-leaders/)**  
   Why governance isn’t just compliance — it’s the backbone of trust and scalability.   -->

---

## 📬 Stay Connected
- Subscribe for updates on new posts and series.  
- Explore the [full archive](/archives/) for all topics.  
- Share your thoughts in the comments — this site is built for conversation as much as instruction.  

---

*Leading with Data is here to help you grow as a leader, not just a technologist. Start with the foundations, then dive into the areas that matter most to your team.*