function tokenize(sql) {
    return sql
        .replace(/\s+/g, " ") // normalize whitespace
        .trim()
        .split(/(\s+|,|\(|\)|;)/) // split on spaces and punctuation
        .filter(t => t.length > 0); // remove empties
}

// Debug harness
function debugTokens(tokens, rules) {
    console.log("Initial tokens:", JSON.stringify(tokens));
    let current = tokens;

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]; // ← use the provided rule
        const name = rule.name || `rule_${i + 1}`;

        const output = rule(current);

        // Normalize return shape
        const outTokens = Array.isArray(output) ? output : output.tokens;
        const outState = Array.isArray(output) ? undefined : output.state;

        current = outTokens;

        if (outState) {
            console.log(`After ${name}:`, JSON.stringify(outTokens), "state:", outState);
        } else {
            console.log(`After ${name}:`, JSON.stringify(outTokens));
        }
    }

    console.log("Final tokens before render:", JSON.stringify(current));
    console.log("Rendered output:", render(current));
    return current;
}

// Core formatter
function formatSQL(sql, options = {}) {
    let tokens = tokenize(sql);

    // Build rules list based on flags
    const rules = [
        options.enableKeywordCase ? keywordCaseRule(options) : null,
        options.enableColumnLayout ? columnLayoutRule(options) : null,
        options.enableCaseLayout ? caseLayoutRule(options) : null,
        options.enableIndent ? indentRule(options) : null,
        options.enableLineBreaks ? lineBreakRule(options) : null,
        options.enableSpacing ? spacingRule(options) : null,
        normalizeWhitespaceRule() // always last
        // add more rules here
    ].filter(Boolean); // remove nulls

    // Debug the pipeline
    const finalTokens = debugTokens(tokens, rules);

    // Normal return
    return render(finalTokens, options);
}

const KEYWORDS = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP", "ORDER",
    "CASE", "END", "WHEN", "THEN", "ELSE", "EXISTS"
]);

function keywordCaseRule({ uppercaseKeywords = true }) {
    return tokens => tokens.map(t => {
        if (KEYWORDS.has(t.toUpperCase())) {
            return uppercaseKeywords ? t.toUpperCase() : t.toLowerCase();
        }
        return t;
    });
}

function columnLayoutRule({
    firstColumnOnNewLine = false,
    columnsPerLine = false,
    indentSize = 2,
    useTabs = false
}) {
    const indentChar = useTabs ? "\t" : " ".repeat(indentSize);
    let insideSelect = false;
    let insideCase = false;
    let firstColumn = true;
    let parenDepth = 0;

    return tokens => {
        const result = [];

        const prevNonSpaceIndex = () => {
            let k = result.length - 1;
            while (k >= 0 && result[k] === " ") k--;
            return k;
        };

        for (let i = 0; i < tokens.length; i++) {
            const raw = tokens[i];
            const tt = raw.toUpperCase().trim();

            // Enter outer SELECT list
            if (tt === "SELECT" && !insideSelect) {
                insideSelect = true;
                firstColumn = true;
                result.push(raw);
                continue;
            }

            // Exit outer SELECT only at top-level FROM
            if (insideSelect && tt === "FROM" && !insideCase && parenDepth === 0) {
                insideSelect = false;
                result.push("\n");
                result.push(raw);
                continue;
            }

            // CASE tracking inside outer SELECT
            if (insideSelect && tt === "CASE") {
                insideCase = true;
                result.push(raw);
                continue;
            }
            if (insideSelect && insideCase && tt === "END") {
                insideCase = false;
                result.push(raw);
                continue;
            }

            // Comma behavior inside outer SELECT (not in CASE)
            if (insideSelect && !insideCase && raw === ",") {
                result.push(",");
                const next = tokens[i + 1] ?? "";
                if (columnsPerLine) {
                    result.push("\n");
                    result.push(indentChar);
                } else if (next.trim() === "(" || next === " ") {
                    // Skip adding space; "(" or an explicit space will follow
                } else {
                    result.push(" ");
                }
                continue;
            }

            // Columns inside outer SELECT list
            if (insideSelect) {
                if (firstColumn) {
                    if (firstColumnOnNewLine) {
                        result.push("\n");
                        result.push(indentChar);
                        result.push(raw);
                    } else {
                        result.push(raw);
                    }
                    firstColumn = false;
                } else {
                    // Handle opening parenthesis using current parenDepth
                    if (raw.trim() === "(") {
                        if (result[result.length - 1] === " ") result.pop();

                        const pIdx = prevNonSpaceIndex();
                        const prevNonSpace = pIdx >= 0 ? result[pIdx] : "";

                        const isAfterComma =
                            prevNonSpace === "," || (typeof prevNonSpace === "string" && prevNonSpace.endsWith(","));

                        const isFunctionCall =
                            typeof prevNonSpace === "string" &&
                            /^[A-Za-z_][A-Za-z0-9_]*$/.test(prevNonSpace.trim().replace(/\n/g, ""));

                        if (!insideCase && parenDepth === 0 && isAfterComma && !isFunctionCall) {
                            result.push("\n");
                            result.push(indentChar);
                            result.push("(");
                        } else {
                            result.push("(");
                        }

                        // Update parenDepth AFTER handling "("
                        parenDepth++;
                        continue;
                    }

                    // Default: pass-through and manage parenDepth for ")"
                    result.push(raw);
                    if (raw.trim() === ")") {
                        parenDepth = Math.max(0, parenDepth - 1);
                    }
                }
                continue;
            }

            // Outside SELECT: pass-through and manage parenDepth
            result.push(raw);
            if (raw.trim() === "(") parenDepth++;
            else if (raw.trim() === ")") parenDepth = Math.max(0, parenDepth - 1);
        }

        return {
            tokens: result,
            state: { insideSelect, insideCase, parenDepth }
        };
    };
}

function caseLayoutRule({ indentSize = 2, useTabs = false }) {
    const indentChar = useTabs ? "\t" : " ".repeat(indentSize);
    let insideCase = false;
    let parenDepth = 0;

    return tokens => {
        const result = [];

        for (let i = 0; i < tokens.length; i++) {
            const raw = tokens[i];
            const t = raw.trim().toUpperCase();

            if (t === "CASE") {
                insideCase = true;
                result.push("\n" + indentChar + "CASE");
                continue;
            }

            if (insideCase && ["WHEN", "THEN", "ELSE"].includes(t)) {
                result.push("\n" + indentChar.repeat(2) + t);
                if (t === "END") insideCase = false;
                continue;
            }

            if (insideCase && t === "END") {
                // align END with CASE
                result.push("\n" + indentChar + "END");
                insideCase = false;
                continue;
            }

            if (insideCase && raw === "(") {
                parenDepth++;
                result.push(" (");
                continue;
            }

            if (insideCase && raw === ")") {
                parenDepth--;
                result.push("\n" + indentChar.repeat(2) + ")");
                continue;
            }

            if (insideCase && parenDepth > 0 && ["SELECT", "FROM", "WHERE"].includes(t)) {
                result.push("\n" + indentChar.repeat(3) + t);
                continue;
            }

            // Outside CASE: just pass through
            result.push(raw);
        }

        return result;
    };
}

function indentRule({ indentSize = 2, useTabs = false }) {
    const indentChar = useTabs ? "\t" : " ".repeat(indentSize);
    let level = 0;

    return tokens => {
        const out = [];
        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];

            // find the last non-space token we emitted
            let j = out.length - 1;
            while (j >= 0 && out[j].trim() === "") j--;
            const prev = j >= 0 ? out[j] : "";
            const prevTrim = prev.trim().toUpperCase();

            const isFunctionCall = /^[A-Z_][A-Z0-9_]*$/.test(prevTrim);

            if (t === "(") {
                if (isFunctionCall) {
                    // inline function call
                    out.push("(");
                } else {
                    level++;
                    out.push("(\n" + indentChar.repeat(level));
                }
                continue;
            }

            if (t === ")") {
                if (isFunctionCall) {
                    // inline closing parenthesis
                    out.push(")");
                } else {
                    level = Math.max(0, level - 1);
                    out.push("\n" + indentChar.repeat(level) + ")");
                }
                continue;
            }

            if (["SELECT", "FROM", "WHERE", "JOIN", "GROUP", "ORDER"].includes(t.toUpperCase())) {
                out.push("\n" + indentChar.repeat(level) + t);
                continue;
            }

            if (["CASE", "WHEN", "THEN", "ELSE", "END"].includes(t.toUpperCase())) {
                const caseIndent = level > 0 ? level + 1 : 1;
                out.push("\n" + indentChar.repeat(caseIndent) + t);
                continue;
            }

            out.push(t);
        }
        return out;
    };
}

function lineBreakRule({ linesBetweenQueries = 1 }) {
    return tokens => tokens.map(t => {
        if (t === ";") return ";\n".repeat(linesBetweenQueries);
        return t;
    });
}

function spacingRule() {
    return tokens => tokens.map(t => {
        if (t === ",") return ",";
        if (t === ";") return ";";
        if (t === "(") return "(";
        if (t === ")") return ")";
        return t;
    });
}

function normalizeWhitespaceRule() {
    return tokens => {
        const out = [];
        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];

            // Collapse consecutive newlines
            if (t === "\n" && out[out.length - 1] === "\n") {
                continue;
            }

            // Drop a space immediately after a newline
            if (t === " " && out[out.length - 1] === "\n") {
                continue;
            }

            // Drop a space immediately before a newline
            if (t === "\n" && out[out.length - 1] === " ") {
                out.pop();
                out.push("\n");
                continue;
            }

            // Drop a space before "(" if preceded by newline or indent
            if (
                t === "(" &&
                out[out.length - 1] === " " &&
                (out[out.length - 2] === "\n" || (out[out.length - 2] || "").trim() === "")
            ) {
                out.pop(); // remove the space
                out.push("(");
                continue;
            }

            out.push(t);
        }
        return out;
    };
}

function render(tokens) {
    return tokens
        .join("")
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, match => match) // preserve indents
        .trim();
}

function updatePreview() {
    const input = document.getElementById("sql-input").value;

    const uppercase = document.getElementById("uppercase").value === "true";
    const indentValue = document.getElementById("indent").value;
    const useTabs = indentValue === "tab";
    const indentSize = useTabs ? 0 : parseInt(indentValue, 10);
    const linesBetweenQueries = parseInt(document.getElementById("linesBetweenQueries").value, 10)
    const firstColumnOnNewLine = document.getElementById("firstColumnOnNewLine").value === "true"
    const columnsPerLine = document.getElementById("columnsPerLine").value === "true";

    const formatted = formatSQL(input, {
        uppercaseKeywords: uppercase,
        indentSize: indentSize,
        useTabs: useTabs,
        linesBetweenQueries: linesBetweenQueries,
        columnsPerLine: columnsPerLine,
        firstColumnOnNewLine: firstColumnOnNewLine,

        // debug toggles from checkboxes
        enableKeywordCase: document.getElementById("toggleKeywordCase").checked,
        enableColumnLayout: document.getElementById("toggleColumnLayout").checked,
        enableCaseLayout: document.getElementById("toggleCaseLayout").checked,
        enableIndent: document.getElementById("toggleIndent").checked,
        enableLineBreaks: document.getElementById("toggleLineBreaks").checked,
        enableSpacing: document.getElementById("toggleSpacing").checked
    });

    const output = document.getElementById("sql-output");
    output.textContent = formatted;
    Prism.highlightElement(output);
}

function attachListeners() {
    const sqlInput = document.getElementById("sql-input");
    const uppercase = document.getElementById("uppercase");
    const columnsPerLine = document.getElementById("columnsPerLine");
    const indent = document.getElementById("indent");
    const linesBetweenQueries = document.getElementById("linesBetweenQueries");
    const firstColumnOnNewLine = document.getElementById("firstColumnOnNewLine");

    // new toggle checkboxes
    const toggleKeywordCase = document.getElementById("toggleKeywordCase");
    const toggleColumnLayout = document.getElementById("toggleColumnLayout");
    const toggleCaseLayout = document.getElementById("toggleCaseLayout");
    const toggleIndent = document.getElementById("toggleIndent");
    const toggleLineBreaks = document.getElementById("toggleLineBreaks");
    const toggleSpacing = document.getElementById("toggleSpacing");

    function maybeUpdatePreview() {
        if (document.getElementById("livePreview").checked) {
            updatePreview();
        }
    }

    sqlInput.addEventListener("input", maybeUpdatePreview);
    uppercase.addEventListener("change", maybeUpdatePreview);
    columnsPerLine.addEventListener("change", maybeUpdatePreview);
    indent.addEventListener("change", maybeUpdatePreview);
    linesBetweenQueries.addEventListener("change", maybeUpdatePreview);
    firstColumnOnNewLine.addEventListener("change", maybeUpdatePreview);

    // attach listeners for toggles
    toggleKeywordCase.addEventListener("change", maybeUpdatePreview);
    toggleColumnLayout.addEventListener("change", maybeUpdatePreview);
    toggleCaseLayout.addEventListener("change", maybeUpdatePreview);
    toggleIndent.addEventListener("change", maybeUpdatePreview);
    toggleLineBreaks.addEventListener("change", maybeUpdatePreview);
    toggleSpacing.addEventListener("change", maybeUpdatePreview);
}

// Call this once on page load
attachListeners();
updatePreview();