---
layout: page
title: Transformer UI
permalink: /transformer-ui/
---

<h1>XML Transformer</h1>

<div class="transformer-ui">
  <label for="xmlInput"><strong>XML Input</strong></label>
  <textarea id="xmlInput" rows="8" placeholder="Paste your XML here..."></textarea>

  <label for="xsltInput"><strong>XSLT Stylesheet</strong></label>
  <textarea id="xsltInput" rows="10" placeholder="Paste your XSLT here..."></textarea>

  <button onclick="transformXML()">Transform</button>

  <label for="output"><strong>Transformed Output</strong></label>
  <pre id="output" class="output-block"></pre>
</div>

<script>
async function transformXML() {
  const xml = document.getElementById("xmlInput").value;
  const xslt = document.getElementById("xsltInput").value;

  const response = await fetch("http://localhost:4567/transform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml, xslt })
  });

  const result = await response.text();
  document.getElementById("output").textContent = result;
}
</script>

<style>
.transformer-ui textarea {
  width: 100%;
  font-family: monospace;
  margin-bottom: 1em;
}
.transformer-ui button {
  display: block;
  margin: 1em 0;
}
.output-block {
  background: #f5f5f5;
  padding: 1em;
  white-space: pre-wrap;
  border: 1px solid #ccc;
  height: 400px;
  overflow: auto;
}
</style>