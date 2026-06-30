---
layout: page
title: "SQL Modeling Patterns"
description: "Practical modeling patterns for dimensional models, process‑aligned facts, and maintainable SQL transformations."
permalink: /walkthroughs/sql-modeling-patterns/
icon: fas fa-database
---

## Why SQL modeling patterns matter

SQL models fall apart when they’re hard to understand, hard to change, or hard to trust.  
Modeling patterns solve that by giving you consistent structures for how data moves from source → staging → core → marts, and how tables reflect real business processes instead of ad‑hoc queries.

This walkthrough covers the patterns I use to keep SQL models clear, testable, and aligned to the operating model.

---

## Layered architecture

I use a simple, layered structure:

- **Source** – raw ingestion, 1:1 with upstream systems  
- **Staging** – typed, standardized, lightly cleaned  
- **Core** – business‑aligned dimensions and facts  
- **Marts** – report‑ready tables for specific use cases  

A typical layout:

    src_erp_orders
    stg_orders
    dim_customer
    dim_product
    fct_order
    fct_order_line
    mart_sales_daily

The rule: every table has a clear role, and you never mix “report logic” into core tables.

---

## Pattern 1: Stable date table

A date table is the backbone of any time‑based model.

```sql
    CREATE TABLE dim_date AS
    SELECT
        d::date                            AS date_key,
        EXTRACT(YEAR  FROM d)              AS year,
        EXTRACT(MONTH FROM d)              AS month,
        TO_CHAR(d, 'YYYY-MM')              AS year_month,
        EXTRACT(DAY   FROM d)              AS day,
        EXTRACT(DOW   FROM d)              AS day_of_week,
        CASE WHEN EXTRACT(DOW FROM d) IN (6, 0)
            THEN TRUE ELSE FALSE END      AS is_weekend
    FROM GENERATE_SERIES(
        DATE '2015-01-01',
        DATE '2035-12-31',
        INTERVAL '1 day'
    ) AS d;
```

Key ideas:

- generate once, reuse everywhere  
- keep it stable (no business logic that changes over time)  
- use it to anchor all facts to a consistent calendar

---

## Pattern 2: CTE‑driven transformations

Instead of giant, unreadable queries, use named CTEs to express each step.

```sql
    WITH raw_orders AS (
        SELECT * FROM src_erp_orders
    ),
    typed_orders AS (
        SELECT
            CAST(order_id AS bigint)      AS order_id,
            CAST(order_date AS date)      AS order_date,
            CAST(customer_id AS bigint)   AS customer_id,
            CAST(total_amount AS numeric) AS total_amount
        FROM raw_orders
    ),
    validated_orders AS (
        SELECT *
        FROM typed_orders
        WHERE order_date IS NOT NULL
            AND customer_id IS NOT NULL
    )
    SELECT *
    FROM validated_orders;
```

Rules:

- each CTE has a single responsibility  
- name CTEs after what they do (`typed_`, `validated_`, `enriched_`)  
- this makes debugging and code review dramatically easier

---

## Pattern 3: Process‑aligned fact tables

Facts should represent **events in the operating model**, not arbitrary aggregates.

Example: `fct_order` for the order lifecycle.

```sql
    CREATE TABLE fct_order AS
    SELECT
        o.order_id,
        o.customer_id,
        o.order_date,
        dd.year,
        dd.month,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at
    FROM stg_orders AS o
    JOIN dim_date AS dd
        ON dd.date_key = o.order_date;
```

Key ideas:

- one row per business event (order, shipment, invoice, etc.)  
- always join to `dim_date` (and other dims) in the fact build  
- keep measures at the grain of the event (no pre‑aggregated totals unless it’s a summary fact)

---

## Pattern 4: Slowly changing dimensions (SCD Type 2)

When attributes change over time (e.g., customer segment), you need history.

```sql
    CREATE TABLE dim_customer AS
    SELECT
        customer_id,
        customer_name,
        segment,
        valid_from,
        valid_to,
        is_current
    FROM stg_customer_history;
```

Typical rules:

- `valid_from` / `valid_to` define the active window  
- `is_current = TRUE` for the latest version  
- facts join on both `customer_id` and the event date to pick the correct version  

This keeps your model honest about history instead of silently overwriting it.

---

## Pattern 5: Report‑ready marts

Marts are thin, purpose‑built tables for specific reporting needs.

Example: daily sales:

```sql
    CREATE TABLE mart_sales_daily AS
    SELECT
        dd.date_key,
        dd.year,
        dd.month,
        SUM(f.total_amount) AS sales_amount
    FROM fct_order AS f
    JOIN dim_date AS dd
    ON dd.date_key = f.order_date
    GROUP BY
        dd.date_key,
        dd.year,
        dd.month;
```

Rules:

- marts are derived from facts + dims, never directly from source  
- each mart serves a clear reporting use case  
- keep them simple enough that BI tools don’t need complex logic  

---

## How this ties back to Process‑First Data Strategy

Each pattern exists to support real processes:

- date table → stable time backbone for planning, operations, and reporting  
- CTE‑driven transformations → transparent, reviewable pipelines  
- process‑aligned facts → models that mirror how the business actually works  
- SCD dimensions → honest history for decision‑making  
- marts → decision‑ready outputs for specific audiences  

You’re not just writing SQL—you’re modeling the operating system of the business.

---

## Related walkthroughs

- [Date Table](/walkthroughs/date-table-sql/)  
- [Report Templates](/walkthroughs/power-bi-report-templates/)  
- [PBIX vs PBIP](/walkthroughs/pbix-vs-pbip/)
