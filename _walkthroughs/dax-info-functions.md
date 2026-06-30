---
layout: page
title: "Surfacing Power BI Model Metadata with INFO Functions"
description: "Use INFO.TABLES, INFO.COLUMNS, INFO.RELATIONSHIPS, and INFO.MEASURES to expose model metadata directly in Power BI for documentation, QA, and governance."
icon: fas fa-terminal
permalink: /walkthroughs/info-functions-metadata/
# image:
#   path: /assets/images/posts/info-functions/info-functions-overview.png
#   alt: "Power BI INFO functions metadata table example"
---

<!--
Structured Data: BlogPosting schema for SEO
-->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Surfacing Power BI Model Metadata with INFO Functions",
  "description": "Use INFO.TABLES, INFO.COLUMNS, INFO.RELATIONSHIPS, and INFO.MEASURES to expose model metadata directly in Power BI for documentation, QA, and governance.",
  "image": "https://thebookofdale.github.io/assets/images/posts/info-functions/info-functions-overview.png",
  "author": {
    "@type": "Person",
    "name": "Christopher Dale"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The Book of Dale",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thebookofdale.github.io/assets/images/logo.png"
    }
  },
  "url": "https://thebookofdale.github.io/posts/info-functions-metadata/",
  "datePublished": "2025-10-20T12:20:00-04:00",
  "dateModified": "2025-10-20T12:20:00-04:00",
  "articleSection": ["Analytics", "Power BI", "DAX"],
  "keywords": ["Power BI", "DAX", "Metadata", "Data Modeling", "Governance"],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://thebookofdale.github.io/posts/info-functions-metadata/"
  }
}
</script>

## 🧠 Power BI Metadata with INFO Functions: Tables, Columns, Relationships, and Measures

Power BI’s semantic models are rich with metadata — but until recently, accessing that metadata required external tools or SQL-based DMVs. Now, with the introduction of DAX-native `INFO` functions like `INFO.TABLES`, `INFO.COLUMNS`, `INFO.RELATIONSHIPS`, and `INFO.MEASURES`, we can surface model internals directly inside the model itself.

These functions return *table outputs* that can be filtered, joined, and visualized just like any other DAX table — unlocking new possibilities for self-documenting models, QA dashboards, and governance overlays.

---

### 🔍 What Are These INFO Functions?

Each function returns metadata about a specific part of the model:

| Function               | Returns                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `INFO.TABLES()`        | List of all tables in the model, including type and storage mode                |
| `INFO.COLUMNS()`       | List of all columns, with data type, encoding, and lineage                      |
| `INFO.RELATIONSHIPS()` | All relationships, including cardinality, direction, and active/inactive status |
| `INFO.MEASURES()`      | All measures, with expression text, dependencies, and formatting                |

These functions are based on Analysis Services DMVs but reimagined for DAX. They require semantic model admin permissions and are best used in DAX Query View or as part of calculated tables in enterprise models.

---

### 🧱 Building a Metadata Table

Here’s how you might use `INFO.TABLES()` to create a metadata summary:

TablesMetadata =
SELECTCOLUMNS(
    INFO.TABLES(),
    "Table Name", [TABLE_NAME],
    "Type", [TABLE_TYPE],
    "Storage Mode", [STORAGE_MODE]
)

You can do the same with columns:

ColumnsMetadata =
SELECTCOLUMNS(
    FILTER(INFO.COLUMNS(), [TABLE_NAME] = "Sales"),
    "Column Name", [COLUMN_NAME],
    "Data Type", [DATA_TYPE],
    "Encoding", [ENCODING_TYPE]
)

And relationships:

RelationshipsMetadata =
SELECTCOLUMNS(
    INFO.RELATIONSHIPS(),
    "From Table", [FROM_TABLE],
    "From Column", [FROM_COLUMN],
    "To Table", [TO_TABLE],
    "To Column", [TO_COLUMN],
    "Cardinality", [CARDINALITY],
    "Direction", [CROSSFILTER_DIRECTION]
)

---

### 📊 Building a Measure Catalog

You can even combine these with `INFO.MEASURES()` to build a measure catalog:

MeasuresCatalog =
SELECTCOLUMNS(
    INFO.MEASURES(),
    "Measure Name", [MEASURE_NAME],
    "Expression", [EXPRESSION],
    "Format String", [FORMAT_STRING]
)

---

### 🧠 Strategic Use Cases

These metadata tables can power:

- ✅ *Model documentation dashboards* for governance and onboarding
- 🔍 *QA overlays* to validate column types, relationship directions, and measure dependencies
- 🧭 *Dynamic tooltips* that explain model logic to end users
- 🔄 *Refresh diagnostics* when paired with `NOW()` or `UTCNOW()`
- 🔐 *Security audits* to track sensitive columns or RLS dependencies

---

### 🧩 Integration Tips

- Use `SELECTCOLUMNS` or `ADDCOLUMNS` to shape the output
- Filter by table name or column name to scope results
- Consider exporting these tables to Excel or embedding in Power BI dashboards for transparency

---

show_image_in_post: true
---

<!--
Structured Data: BlogPosting schema for SEO
-->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Surfacing Power BI Model Metadata with INFO Functions",
  "description": "Use INFO.TABLES, INFO.COLUMNS, INFO.RELATIONSHIPS, and INFO.MEASURES to expose model metadata directly in Power BI for documentation, QA, and governance.",
  "image": "https://thebookofdale.github.io/assets/images/posts/info-functions/info-functions-overview.png",
  "author": {
    "@type": "Person",
    "name": "Christopher Dale"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The Book of Dale",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thebookofdale.github.io/assets/images/logo.png"
    }
  },
  "url": "https://thebookofdale.github.io/posts/info-functions-metadata/",
  "datePublished": "2025-10-20T12:20:00-04:00",
  "dateModified": "2025-10-20T12:20:00-04:00",
  "articleSection": ["Analytics", "Power BI", "DAX"],
  "keywords": ["Power BI", "DAX", "Metadata", "Data Modeling", "Governance"],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://thebookofdale.github.io/posts/info-functions-metadata/"
  }
}
</script>

## ❓ Frequently Asked Questions

### What are Power BI INFO functions?
INFO functions like `INFO.TABLES`, `INFO.COLUMNS`, `INFO.RELATIONSHIPS`, and `INFO.MEASURES` return metadata about your semantic model — including table structure, column types, relationships, and measure definitions — directly within DAX.

### Why should I use INFO functions in my model?
They allow you to build self-documenting models, QA dashboards, and governance overlays without relying on external tools or DMVs.

### Can I use INFO functions in calculated tables?
Yes — these functions return table outputs that can be used in calculated tables, filtered, and visualized like any other DAX table.

### Do INFO functions require special permissions?
Yes — you need semantic model admin permissions to use these functions, especially in DAX Query View or when authoring calculated tables in Power BI Desktop.

<!-- Structured Data: FAQ schema for SEO -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are Power BI INFO functions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "INFO functions like INFO.TABLES, INFO.COLUMNS, INFO.RELATIONSHIPS, and INFO.MEASURES return metadata about your semantic model — including table structure, column types, relationships, and measure definitions — directly within DAX."
      }
    },
    {
      "@type": "Question",
      "name": "Why should I use INFO functions in my model?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They allow you to build self-documenting models, QA dashboards, and governance overlays without relying on external tools or DMVs."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use INFO functions in calculated tables?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — these functions return table outputs that can be used in calculated tables, filtered, and visualized like any other DAX table."
      }
    },
    {
      "@type": "Question",
      "name": "Do INFO functions require special permissions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — you need semantic model admin permissions to use these functions, especially in DAX Query View or when authoring calculated tables in Power BI Desktop."
      }
    }
  ]
}
</script>