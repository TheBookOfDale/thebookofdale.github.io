---
layout: page
title: Series
permalink: /series/
---
<ul>
  {% for s in site.series %}
    <li><a href="{{ s.url }}">{{ s.title }}</a></li>
  {% endfor %}
</ul>