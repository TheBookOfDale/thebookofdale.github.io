---
layout: page
title: Text Splitter
permalink: /tools/text-splitter/
---

<div class="text-splitter-tool">
  <h2>Split Your Text Into Sections</h2>
  
  <!-- Input -->
  <textarea id="inputText" placeholder="Paste or drop your text here..." rows="10"></textarea>
  
  <!-- Options -->
  <label for="splitMethod">Split by:</label>
  <select id="splitMethod">
    <option value="chars">Character count</option>
    <option value="paragraphs">Paragraphs</option>
    <option value="sentences">Sentences</option>
    <option value="delimiter">Custom delimiter</option>
  </select>
  
  <input id="splitSize" type="number" placeholder="Size or delimiter" />
  
  <button onclick="splitText()">Split Text</button>
  
  <!-- Output -->
  <div id="output"></div>
</div>

<link rel="stylesheet" href="/assets/css/tools/text-splitter.css">
<script src="/assets/js/tools/text-splitter.js"></script>