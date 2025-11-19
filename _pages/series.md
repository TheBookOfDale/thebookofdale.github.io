---
layout: page
title: Series
permalink: /series/
---
{% for s in site.series %}

- [{{ s.title }}]({{ s.url }})
{% endfor %}
