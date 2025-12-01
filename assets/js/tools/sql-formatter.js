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
        const rule = rules[i];
        const name = rule.name || `rule_${i + 1}`;
        current = rule(current);
        console.log(`After ${name}:`, JSON.stringify(current));
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
        options.enableSpacing ? spacingRule(options) : null
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
    let insideCase = false;   // NEW: track CASE
    let firstColumn = true;

    return tokens => {
        const result = [];

        for (let i = 0; i < tokens.length; i++) {
            const raw = tokens[i];
            const t = raw.toUpperCase();

            // Enter SELECT list
            if (t === "SELECT") {
                insideSelect = true;
                firstColumn = true;
                result.push(raw);
                continue;
            }

            // Exit SELECT list at FROM
            if (insideSelect && t === "FROM") {
                insideSelect = false;
                result.push("\n" + raw);
                continue;
            }

            // Track CASE/END
            if (insideSelect && t === "CASE") {
                insideCase = true;
                result.push(raw);
                continue;
            }
            if (insideSelect && insideCase && t === "END") {
                insideCase = false;
                result.push(raw);
                continue;
            }

            // Comma behavior only inside SELECT and not inside CASE
            if (insideSelect && !insideCase && raw === ",") {
                result.push(",");
                if (columnsPerLine) {
                    result.push("\n" + indentChar);
                } else {
                    result.push(" ");
                }
                continue;
            }

            // Columns inside SELECT
            if (insideSelect) {
                if (firstColumn) {
                    if (firstColumnOnNewLine) {
                        result.push("\n" + indentChar + raw.trimStart());
                    } else {
                        result.push(raw);
                    }
                    firstColumn = false;
                } else {
                    const prev = result[result.length - 1] || "";
                    const prevToken = prev.trim().toUpperCase();

                    if (KEYWORDS.has(t) && KEYWORDS.has(prevToken)) {
                        result.push(" " + raw);
                    } else if (raw.trim() === "") {
                        continue;
                    } else if (!insideCase && raw.trim() === "(") {
                        if (prev === " ") result.pop();
                        result.push("\n" + indentChar + "(");
                        continue;
                    } else {
                        result.push(KEYWORDS.has(t) ? raw : raw.trimStart());
                    }
                }
                continue;
            }

            // Outside SELECT
            result.push(raw);
        }

        return result;
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
    return tokens => tokens.map(t => {
        if (t === "(") {
            level++;
            return "(\n" + indentChar.repeat(level);
        }
        if (t === ")") {
            level = Math.max(0, level - 1);
            return "\n" + indentChar.repeat(level) + ")";
        }
        if (["SELECT", "FROM", "WHERE", "JOIN", "GROUP", "ORDER"].includes(t.toUpperCase())) {
            // indent keywords relative to nesting level
            return "\n" + indentChar.repeat(level) + t;
        }
        if (["CASE", "WHEN", "THEN", "ELSE", "END"].includes(t.toUpperCase())) {
            // indent CASE expressions relative to current nesting
            const caseIndent = level > 0 ? level + 1 : 1;
            return "\n" + indentChar.repeat(caseIndent) + t;
        }
        return t;
    });
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