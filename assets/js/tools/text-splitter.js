document.addEventListener("DOMContentLoaded", () => {
  const tool = document.querySelector(".text-splitter-tool");
  if (!tool) return; // safety check

  const inputText = tool.querySelector("#inputText");
  const splitMethod = tool.querySelector("#splitMethod");
  const splitSize = tool.querySelector("#splitSize");
  const outputDiv = tool.querySelector("#output");

  // Restore saved settings
  const savedMethod = localStorage.getItem("splitMethod");
  const savedSize = localStorage.getItem("splitSize");
  if (savedMethod) splitMethod.value = savedMethod;
  if (savedSize) splitSize.value = savedSize;

  window.currentChunks = [];

  window.splitText = function () {
    const text = inputText.value;
    const method = splitMethod.value;
    const sizeOrDelimiter = splitSize.value;
    let chunks = [];

    // Guard: empty input
    if (!text.trim()) {
      alert("Please paste some text first.");
      return;
    }

    // Save settings
    localStorage.setItem("splitMethod", method);
    localStorage.setItem("splitSize", sizeOrDelimiter);

    // Splitting logic
    if (method === "chars") {
      const size = parseInt(sizeOrDelimiter, 10) || 10000;
      for (let i = 0; i < text.length; i += size) {
        chunks.push(text.substring(i, i + size));
      }
    } else if (method === "paragraphs") {
      chunks = text.split(/\n\s*\n/);
    } else if (method === "sentences") {
      chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    } else if (method === "delimiter") {
      if (!sizeOrDelimiter) {
        alert("Please enter a delimiter.");
        return;
      }
      chunks = text.split(sizeOrDelimiter);
    }

    // Render output
    outputDiv.innerHTML = "";
    chunks.forEach((chunk, index) => {
      const section = document.createElement("div");
      section.className = "chunk";
      section.innerHTML = `
        <h3>Section ${index + 1}</h3>
        <textarea readonly rows="6">${chunk}</textarea>
        <button class="copy-btn" onclick="copyChunk(${index})" aria-label="Copy Section ${index + 1}">📋 Copy</button>
      `;
      outputDiv.appendChild(section);
    });

    window.currentChunks = chunks;
  };

  window.copyChunk = function (index) {
    const chunk = window.currentChunks[index];
    navigator.clipboard.writeText(chunk).then(() => {
      const btn = outputDiv.querySelectorAll(".copy-btn")[index];
      btn.textContent = "✅ Copied!";
      setTimeout(() => (btn.textContent = "📋 Copy"), 1500);
    });
  };
});