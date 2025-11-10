---
layout: page
title: XSLT Transformer
permalink: /tools/xslt-transformer/
---

<h1>XML Transformer</h1>

<div class="transformer-ui">
  <label for="xmlInput"><strong>XML Input</strong></label>
  <textarea id="xmlInput" rows="8" placeholder="Paste your XML here..."></textarea>

  <label for="xsltInput"><strong>XSLT Stylesheet</strong></label>
  <textarea id="xsltInput" rows="10" placeholder="Paste your XSLT here..."></textarea>

  <div class="button-row">
    <button class="button" onclick="transformXML()">Transform</button>
    <!-- <div class="output-toggle"> -->
      <button class="toggle-button" id="toggleXML" onclick="showXML()">XML</button>
      <button class="toggle-button" id="toggleRendered" onclick="showRendered()">Rendered</button>
      <button class="toggle-button" id="toggleText" onclick="showText()">Text</button>
    <!-- </div> -->
  </div>

  <label for="output"><strong>Transformed Output</strong></label>
  <div id="viewXML" class="output-view">
    <pre class="output-block"><code id="outputXML" class="language-xml"></code></pre>
  </div>

  <div id="viewRendered" class="output-view" style="display: none;">
    <iframe id="outputRendered" class="output-block"></iframe>
  </div>

  <div id="viewText" class="output-view" style="display: none;">
    <pre class="output-block"><code id="outputText"></code></pre>
  </div>
</div>

<link href="https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/prismjs/prism.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs/components/prism-xml.min.js"></script>

<!-- Include js file -->
<script src="/assets/js/xslt-transformer.js"></script>

<!-- Link to css -->
<link rel="stylesheet" href="/assets/css/xslt-transformer.css">

<script>
  const useSampleData = true; // ✅ Toggle this to false to start blank
  window.addEventListener("DOMContentLoaded", () => {
  if (useSampleData) {
    document.getElementById("xmlInput").value = `
<library>
  <book>
    <title>1984</title>
    <author>George Orwell</author>
  </book>
  <book>
    <title>Brave New World</title>
    <author>Aldous Huxley</author>
  </book>
</library>
`.trim();

    document.getElementById("xsltInput").value = `
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/library">
    <html>
      <head><title>Library Catalog</title></head>
      <body>
        <h1>Library Catalog</h1>
        <table border="1">
          <tr><th>Title</th><th>Author</th></tr>
          <xsl:for-each select="book">
            <tr>
              <td><xsl:value-of select="title"/></td>
              <td><xsl:value-of select="author"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`.trim();
  }
});
</script>