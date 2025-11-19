async function transformXML() {
  const xml = document.getElementById("xmlInput").value;
  const xslt = document.getElementById("xsltInput").value;

  // 🔍 Check output method
  const method = getOutputMethod(xslt);
  const renderedBtn = document.getElementById("toggleRendered");

  if (method === "html") {
    renderedBtn.classList.remove("hidden");
    renderedBtn.classList.add("inline-block");
    renderedBtn.disabled = false;
    renderedBtn.title = "";
  } else {
    renderedBtn.classList.add("hidden");
    renderedBtn.classList.remove("inline-block");
    renderedBtn.disabled = true;
    renderedBtn.title = "Rendered view only available for HTML output";
  }

  try {
    const response = await fetch("http://localhost:4567/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml, xslt })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.text();

    // XML view
    const XMLCode = document.querySelector("#viewXML code");
    XMLCode.textContent = result;
    Prism.highlightElement(XMLCode);

    // Rendered view
    const iframe = document.querySelector("#viewRendered iframe");
    iframe.srcdoc = ensureWhiteBackground(result);

    // Text view
    const textCode = document.querySelector("#viewText code");
    textCode.className = ""; // Ensure no syntax highlighting
    textCode.textContent = result;

    // Show default view
    showXML();
  } catch (err) {
    const errorMessage = `Error: ${err.message}`;

    document.querySelector("#viewXML code").textContent = errorMessage;
    document.querySelector("#viewRendered iframe").srcdoc = errorMessage;
    document.querySelector("#viewText code").textContent = errorMessage;

    showXML();
    console.error("Transformation failed:", err);
  }
}

function copyOutput() {
  const output = document.getElementById("output");
  const text = output.tagName === "TEXTAREA" ? output.value : output.textContent;

  navigator.clipboard.writeText(text)
    .then(() => {
      const status = document.getElementById("copyStatus");
      status.classList.add("visible");
      setTimeout(() => {
        status.classList.remove("visible");
      }, 2000); // Hide after 2 seconds
    })
    .catch(err => alert("Failed to copy: " + err));
}

function setToggle(selectedId) {
  ["toggleXML", "toggleRendered", "toggleText"].forEach(id =>
    document.getElementById(id).classList.remove("selected")
  );
  document.getElementById(selectedId).classList.add("selected");
}

function showView(viewId, toggleId) {
  const views = ["viewXML", "viewRendered", "viewText"];
  const toggles = ["toggleXML", "toggleRendered", "toggleText"];

  views.forEach(id => {
    const el = document.getElementById(id);
    if (id === viewId) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  toggles.forEach(id => {
    const btn = document.getElementById(id);
    btn.classList.toggle("selected", id === toggleId);
  });
}

function showXML() { showView("viewXML", "toggleXML"); }
function showRendered() { showView("viewRendered", "toggleRendered"); }
function showText() { showView("viewText", "toggleText"); }

function ensureWhiteBackground(html) {
  const hasBody = html.includes("<body");
  const hasStyle = html.includes("background-color");

  if (hasBody && hasStyle) return html;

  return `
    <html>
      <head>
        <style>
          body { background-color: white; color: black; margin: 1em; font-family: sans-serif; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `;
}

function updateOutput(result) {
  const isHtml = result.trim().startsWith("<html") || result.includes("<body>");
  const codeBlock = document.getElementById("outputXML").querySelector("code");
  const rendered = document.getElementById("outputRendered");

  if (isHtml) {
    codeBlock.textContent = result;             // ✅ Show raw HTML in code block
    Prism.highlightElement(codeBlock);          // ✅ Highlight it
    rendered.srcdoc = result;
    showRendered();
  } else {
    // const formatted = formatXml(result);
    // document.getElementById("outputXML").textContent = formatted;
    codeBlock.textContent = formatXml(result);
    Prism.highlightElement(codeBlock);
    showXML();
  }
}

function getOutputMethod(xslt) {
  const match = xslt.match(/<xsl:output[^>]*method=["']([^"']+)["']/);
  return match ? match[1] : "xml"; // default to xml if not specified
}

function formatXml(xml) {
  const PADDING = "  "; // 2-space indent
  const reg = /(>)(<)(\/*)/g;
  let formatted = "";
  let pad = 0;

  xml = xml.replace(reg, "$1\n$2");
  xml.split("\n").forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    formatted += PADDING.repeat(pad) + node + "\n";
    pad += indent;
  });

  return formatted.trim();
}