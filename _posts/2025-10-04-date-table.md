---
layout: post
title: "Building a Robust Date Table for Analytics in SQL"
date: 2025-10-04 13:15:00 -0400
published: true
categories: [Analytics, Power BI, SQL]
tags: [Power BI, SQL Server, Date Table, Data Modeling]
description: "Learn how to create and populate a reusable SQL date table that powers consistent time intelligence in analytics and Power BI."
image:
  path: /assets/images/posts/date-table/date-sql-results.png
  alt: "SQL date table query results"
permalink: /posts/date-table-sql/
series: Manufacturing Analytics Foundations
pin: false
comments: true
show_image_in_post: true
---

<!--
Structured Data: BlogPosting schema for SEO
-->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Building a Robust Date Table for Analytics in SQL",
  "description": "Learn how to create and populate a reusable SQL date table that powers consistent time intelligence in analytics and Power BI.",
  "image": "https://thebookofdale.github.io/assets/images/date-table-thumb.png",
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
  "url": "https://thebookofdale.github.io/posts/date-table-sql/",
  "datePublished": "2025-10-12T13:15:00-04:00",
  "dateModified": "2025-10-12T13:15:00-04:00",
  "articleSection": ["Analytics", "Power BI", "SQL"],
  "keywords": ["Power BI", "SQL Server", "Date Table", "Data Modeling"],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://thebookofdale.github.io/posts/date-table-sql/"
  }
}
</script>

## ✨ Intro

Every analytics solution needs a **date table**. Without one, time intelligence becomes inconsistent, messy, and error-prone. A dedicated date table provides the backbone for reporting, ensuring that calculations like year-over-year growth, month-to-date totals, and fiscal calendars are consistent across your entire model.

In this post, I’ll show you how to create a reusable SQL date table, populate it with attributes like day names and quarters, and explain why it’s foundational for Power BI and enterprise reporting.

---

## 🔑 Step 1: Create the Date Table

We’ll start with a clean schema that includes a surrogate key, the actual date, and pre-calculated attributes:

```sql
CREATE TABLE DimDate
(
    DateKey INT NOT NULL PRIMARY KEY,   -- e.g. 20101001
    FullDate DATETIME NOT NULL,         -- e.g. 2010-10-01 00:00:00.000
    Date_Name NVARCHAR(50) NOT NULL,    -- e.g. Friday, January 01 2010

                                        -- Calendar attributes
    [Year] DATETIME NOT NULL,           -- e.g. 2010-01-01
    Year_Name NVARCHAR(50) NOT NULL,    -- e.g. Calendar 2010
    Quarter DATETIME NOT NULL,          -- e.g. 2010-10-01
    Quarter_Name NVARCHAR(50) NOT NULL, -- e.g. Quarter 1, 2010
    [Month] DATETIME NOT NULL,          -- e.g. 2010-10-01
    Month_Name NVARCHAR(50) NOT NULL,   -- e.g. January 2010
    [Week] DATETIME NOT NULL,           -- e.g. 2010-10-01
    Week_Name NVARCHAR(50) NOT NULL,    -- e.g. Week 1, 2010

                                        -- Day breakdowns
    Day_Of_Year INT NOT NULL,
    Day_Of_Year_Name NVARCHAR(20) NOT NULL,
    Day_Of_Quarter INT NOT NULL,
    Day_Of_Quarter_Name NVARCHAR(20) NOT NULL,
    Day_Of_Month INT NOT NULL,
    Day_Of_Month_Name NVARCHAR(20) NOT NULL,
    Day_Of_Week INT NOT NULL,
    Day_Of_Week_Name NVARCHAR(20) NOT NULL,
    Week_Of_Year INT NOT NULL,
    Week_Of_Year_Name NVARCHAR(20) NOT NULL,
    Month_Of_Year INT NOT NULL,
    Month_Of_Year_Name NVARCHAR(20) NOT NULL,
    Month_Of_Quarter INT NOT NULL,
    Month_Of_Quarter_Name NVARCHAR(20) NOT NULL,
    Quarter_Of_Year INT NOT NULL,
    Quarter_Of_Year_Name NVARCHAR(20) NOT NULL,

                                        -- Fiscal attributes
    Fiscal_Year DATETIME NOT NULL,
    Fiscal_Year_Name NVARCHAR(20) NOT NULL,
    Fiscal_Year_Name_Default NVARCHAR(50) NULL,
    Fiscal_Year_FYXX NVARCHAR(10) NULL,
    Fiscal_Quarter DATETIME NOT NULL,
    Fiscal_Quarter_Name NVARCHAR(50) NOT NULL,
    Fiscal_Month DATETIME NOT NULL,
    Fiscal_Month_Name NVARCHAR(50) NOT NULL,
    Fiscal_Month_Year NVARCHAR(20) NOT NULL,
    Fiscal_Month_3Ltr NVARCHAR(10) NOT NULL,
    Fiscal_Week DATETIME NOT NULL,
    Fiscal_Week_End DATETIME NOT NULL,
    Fiscal_Week_Name NVARCHAR(50) NOT NULL,
    Fiscal_Day DATETIME NOT NULL,
    Fiscal_Day_Name NVARCHAR(50) NOT NULL,
    Fiscal_Day_Of_Year INT NOT NULL,
    Fiscal_Day_Of_Year_Name NVARCHAR(20) NOT NULL,
    Fiscal_Day_Of_Quarter INT NOT NULL,
    Fiscal_Day_Of_Quarter_Name NVARCHAR(20) NOT NULL,
    Fiscal_Day_Of_Month INT NOT NULL,
    Fiscal_Day_Of_Month_Name NVARCHAR(20) NOT NULL,
    Fiscal_Day_Of_Week INT NOT NULL,
    Fiscal_Day_Of_Week_Name NVARCHAR(20) NOT NULL,
    Fiscal_Week_Of_Year INT NOT NULL,
    Fiscal_Week_Of_Year_Name NVARCHAR(20) NOT NULL,
    Fiscal_Month_Of_Year INT NOT NULL,
    Fiscal_Month_Of_Year_Name NVARCHAR(20) NOT NULL,
    Fiscal_Month_Of_Quarter INT NOT NULL,
    Fiscal_Month_Of_Quarter_Name NVARCHAR(20) NOT NULL,
    Fiscal_Quarter_Of_Year INT NOT NULL,
    Fiscal_Quarter_Of_Year_Name NVARCHAR(20) NOT NULL,
    Fiscal_Payroll_Period DATETIME NOT NULL,
    Fiscal_Payroll_Period_Name NVARCHAR(50) NOT NULL,
    Fiscal_Payroll_Period_Of_Year INT NOT NULL,
    Fiscal_Payroll_Period_Of_Year_Name NVARCHAR(50) NOT NULL,
    Fiscal_Period DATETIME NOT NULL,
    Fiscal_Period_Name NVARCHAR(50) NOT NULL,
    Fiscal_Period_Of_Year INT NOT NULL,
    Fiscal_Period_Of_Year_Name NVARCHAR(50) NOT NULL,
    FY_PD_KEY NVARCHAR(20) NOT NULL,

                                        -- Operational flags
    WorkDayFlag CHAR(1) NOT NULL,
    ClosedFlag CHAR(1) NOT NULL,
    HourPostedFlag CHAR(1) NOT NULL,
    WeekDayFlag CHAR(1) NOT NULL,
    LastDayOfMonthFlag CHAR(1) NOT NULL,
    FifteenOfMonthFlag CHAR(1) NOT NULL,
    WorkHours INT NOT NULL,
    Last_Two_Fiscal_Weeks_Flag BIT NOT NULL,
    Posting_Week DATE NOT NULL,
    Posting_Week_Date DATETIME NOT NULL
);
```

- **DateKey:** An integer surrogate key in `YYYYMMDD` format for efficient joins  
- **FullDate:** The actual date value  
- **Attributes:** Pre-calculated fields like day name, month name, and quarter number  

---

## 🔑 Step 2: Populate the Table

Here’s a simple loop to generate rows for a given date range:

```sql
DECLARE @StartDate DATE = '2010-01-01';
DECLARE @EndDate DATE = '2030-12-31';

;WITH DateSequence
AS (SELECT @StartDate AS [Date]
    UNION ALL
    SELECT DATEADD(DAY, 1, [Date])
    FROM DateSequence
    WHERE [Date] < @EndDate
   )
INSERT INTO DimDate
(
    DateKey,
    FullDate,
    Date_Name,
    [Year],
    Year_Name,
    Quarter,
    Quarter_Name,
    [Month],
    Month_Name,
    [Week],
    Week_Name,
    Day_Of_Year,
    Day_Of_Year_Name,
    Day_Of_Quarter,
    Day_Of_Quarter_Name,
    Day_Of_Month,
    Day_Of_Month_Name,
    Day_Of_Week,
    Day_Of_Week_Name,
    Week_Of_Year,
    Week_Of_Year_Name,
    Month_Of_Year,
    Month_Of_Year_Name,
    Month_Of_Quarter,
    Month_Of_Quarter_Name,
    Quarter_Of_Year,
    Quarter_Of_Year_Name,
    Fiscal_Year,
    Fiscal_Year_Name,
    Fiscal_Year_Name_Default,
    Fiscal_Year_FYXX,
    Fiscal_Quarter,
    Fiscal_Quarter_Name,
    Fiscal_Month,
    Fiscal_Month_Name,
    Fiscal_Month_Year,
    Fiscal_Month_3Ltr,
    Fiscal_Week,
    Fiscal_Week_End,
    Fiscal_Week_Name,
    Fiscal_Day,
    Fiscal_Day_Name,
    Fiscal_Day_Of_Year,
    Fiscal_Day_Of_Year_Name,
    Fiscal_Day_Of_Quarter,
    Fiscal_Day_Of_Quarter_Name,
    Fiscal_Day_Of_Month,
    Fiscal_Day_Of_Month_Name,
    Fiscal_Day_Of_Week,
    Fiscal_Day_Of_Week_Name,
    Fiscal_Week_Of_Year,
    Fiscal_Week_Of_Year_Name,
    Fiscal_Month_Of_Year,
    Fiscal_Month_Of_Year_Name,
    Fiscal_Month_Of_Quarter,
    Fiscal_Month_Of_Quarter_Name,
    Fiscal_Quarter_Of_Year,
    Fiscal_Quarter_Of_Year_Name,
    Fiscal_Payroll_Period,
    Fiscal_Payroll_Period_Name,
    Fiscal_Payroll_Period_Of_Year,
    Fiscal_Payroll_Period_Of_Year_Name,
    Fiscal_Period,
    Fiscal_Period_Name,
    Fiscal_Period_Of_Year,
    Fiscal_Period_Of_Year_Name,
    FY_PD_KEY,
    WorkDayFlag,
    ClosedFlag,
    HourPostedFlag,
    WeekDayFlag,
    LastDayOfMonthFlag,
    FifteenOfMonthFlag,
    WorkHours,
    Last_Two_Fiscal_Weeks_Flag,
    Posting_Week,
    Posting_Week_Date
)
SELECT CONVERT(INT, FORMAT([Date], 'yyyyMMdd')) AS DateKey,
       [Date] AS FullDate,
       DATENAME(WEEKDAY, [Date]) + ', ' + DATENAME(MONTH, [Date]) + ' '
       + RIGHT('0' + CAST(DAY([Date]) AS VARCHAR(2)), 2) + ' ' + CAST(YEAR([Date]) AS VARCHAR(4)) AS Date_Name,

                                                                                                    -- Calendar
       DATEFROMPARTS(YEAR([Date]), 1, 1) AS [Year],
       'Calendar ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Year_Name,
       DATEFROMPARTS(YEAR([Date]), ((DATEPART(QUARTER, [Date]) - 1) * 3) + 1, 1) AS Quarter,
       'Quarter ' + CAST(DATEPART(QUARTER, [Date]) AS NVARCHAR(1)) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Quarter_Name,
       DATEFROMPARTS(YEAR([Date]), MONTH([Date]), 1) AS [Month],
       DATENAME(MONTH, [Date]) + ' ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Month_Name,
       DATEADD(DAY, 1 - DATEPART(WEEKDAY, [Date]), [Date]) AS [Week],
       'Week ' + CAST(DATEPART(WEEK, [Date]) AS NVARCHAR(2)) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Week_Name,

                                                                                                    -- Day breakdowns
       DATEPART(DAYOFYEAR, [Date]) AS Day_Of_Year,
       'Day ' + CAST(DATEPART(DAYOFYEAR, [Date]) AS NVARCHAR(3)) AS Day_Of_Year_Name,
       DATEPART(DAY, [Date]) AS Day_Of_Quarter,
                                                                                                    -- Simplified
       'Day ' + CAST(DATEPART(DAY, [Date]) AS NVARCHAR(2)) AS Day_Of_Quarter_Name,
       DAY([Date]) AS Day_Of_Month,
       'Day ' + CAST(DAY([Date]) AS NVARCHAR(2)) AS Day_Of_Month_Name,
       DATEPART(WEEKDAY, [Date]) AS Day_Of_Week,
       'Day ' + CAST(DATEPART(WEEKDAY, [Date]) AS NVARCHAR(1)) AS Day_Of_Week_Name,
       DATEPART(WEEK, [Date]) AS Week_Of_Year,
       'Week ' + CAST(DATEPART(WEEK, [Date]) AS NVARCHAR(2)) AS Week_Of_Year_Name,
       MONTH([Date]) AS Month_Of_Year,
       'Month ' + CAST(MONTH([Date]) AS NVARCHAR(2)) AS Month_Of_Year_Name,
       ((MONTH([Date]) - 1) % 3) + 1 AS Month_Of_Quarter,
       'Month ' + CAST(((MONTH([Date]) - 1) % 3) + 1 AS NVARCHAR(1)) AS Month_Of_Quarter_Name,
       DATEPART(QUARTER, [Date]) AS Quarter_Of_Year,
       'Quarter ' + CAST(DATEPART(QUARTER, [Date]) AS NVARCHAR(1)) AS Quarter_Of_Year_Name,

                                                                                                    -- Fiscal (Oct 1 start)
       CASE
           WHEN MONTH([Date]) >= 10 THEN
               DATEFROMPARTS(YEAR([Date]), 10, 1)
           ELSE
               DATEFROMPARTS(YEAR([Date]) - 1, 10, 1)
       END AS Fiscal_Year,
       CAST(CASE
                WHEN MONTH([Date]) >= 10 THEN
                    YEAR([Date]) + 1
                ELSE
                    YEAR([Date])
            END AS NVARCHAR(4)) AS Fiscal_Year_Name,
       CAST(CASE
                WHEN MONTH([Date]) >= 10 THEN
                    YEAR([Date]) + 1
                ELSE
                    YEAR([Date])
            END AS NVARCHAR(4)) + ' (Current FY when current year)' AS Fiscal_Year_Name_Default,
       'FY' + RIGHT(CAST(CASE
                             WHEN MONTH([Date]) >= 10 THEN
                                 YEAR([Date]) + 1
                             ELSE
                                 YEAR([Date])
                         END AS NVARCHAR(4)), 2) AS Fiscal_Year_FYXX,
       DATEFROMPARTS(YEAR([Date]), ((DATEPART(QUARTER, [Date]) - 1) * 3) + 1, 1) AS Fiscal_Quarter, -- Simplified
       'Fiscal Quarter ' + CAST(((MONTH([Date]) - 1) / 3) + 1 AS NVARCHAR(1)) + ', '
       + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Quarter_Name,
       DATEFROMPARTS(YEAR([Date]), MONTH([Date]), 1) AS Fiscal_Month,
       DATENAME(MONTH, [Date]) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Month_Name,
       LEFT(DATENAME(MONTH, [Date]), 3) + ' ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Month_Year,
       LEFT(DATENAME(MONTH, [Date]), 3) AS Fiscal_Month_3Ltr,
       DATEADD(DAY, 1 - DATEPART(WEEKDAY, [Date]), [Date]) AS Fiscal_Week,
       DATEADD(DAY, 7 - DATEPART(WEEKDAY, [Date]), [Date]) AS Fiscal_Week_End,
       'Fiscal Week ' + CAST(DATEPART(WEEK, [Date]) AS NVARCHAR(2)) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Week_Name,
       [Date] AS Fiscal_Day,
       DATENAME(WEEKDAY, [Date]) + ', ' + DATENAME(MONTH, [Date]) + ' ' + CAST(DAY([Date]) AS NVARCHAR(2)) + ' '
       + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Day_Name,
       DATEPART(DAYOFYEAR, [Date]) + 92 AS Fiscal_Day_Of_Year,                                      -- Simplified offset
       'Day ' + CAST(DATEPART(DAYOFYEAR, [Date]) + 92 AS NVARCHAR(3)) AS Fiscal_Day_Of_Year_Name,
       DATEPART(DAY, [Date]) AS Fiscal_Day_Of_Quarter,
       'Day ' + CAST(DATEPART(DAY, [Date]) AS NVARCHAR(2)) AS Fiscal_Day_Of_Quarter_Name,
       DAY([Date]) AS Fiscal_Day_Of_Month,
       'Day ' + CAST(DAY([Date]) AS NVARCHAR(2)) AS Fiscal_Day_Of_Month_Name,
       DATEPART(WEEKDAY, [Date]) AS Fiscal_Day_Of_Week,
       'Day ' + CAST(DATEPART(WEEKDAY, [Date]) AS NVARCHAR(1)) AS Fiscal_Day_Of_Week_Name,
       DATEPART(WEEK, [Date]) AS Fiscal_Week_Of_Year,
       'Week ' + CAST(DATEPART(WEEK, [Date]) AS NVARCHAR(2)) AS Fiscal_Week_Of_Year_Name,
       MONTH([Date]) AS Fiscal_Month_Of_Year,
       'Month ' + CAST(MONTH([Date]) AS NVARCHAR(2)) AS Fiscal_Month_Of_Year_Name,
       ((MONTH([Date]) - 1) % 3) + 1 AS Fiscal_Month_Of_Quarter,
       'Month ' + CAST(((MONTH([Date]) - 1) % 3) + 1 AS NVARCHAR(1)) AS Fiscal_Month_Of_Quarter_Name,
       DATEPART(QUARTER, [Date]) AS Fiscal_Quarter_Of_Year,
       'Quarter ' + CAST(DATEPART(QUARTER, [Date]) AS NVARCHAR(1)) AS Fiscal_Quarter_Of_Year_Name,

                                                                                                    -- Payroll / Periods (simplified placeholders)
       DATEFROMPARTS(YEAR([Date]), MONTH([Date]), 1) AS Fiscal_Payroll_Period,
       'Fiscal Period ' + CAST(MONTH([Date]) AS NVARCHAR(2)) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Payroll_Period_Name,
       MONTH([Date]) AS Fiscal_Payroll_Period_Of_Year,
       'Period ' + CAST(MONTH([Date]) AS NVARCHAR(2)) AS Fiscal_Payroll_Period_Of_Year_Name,
       DATEFROMPARTS(YEAR([Date]), MONTH([Date]), 1) AS Fiscal_Period,
       'Fiscal Payroll Period ' + CAST(MONTH([Date]) AS NVARCHAR(2)) + ', ' + CAST(YEAR([Date]) AS NVARCHAR(4)) AS Fiscal_Period_Name,
       MONTH([Date]) AS Fiscal_Period_Of_Year,
       'Period ' + CAST(MONTH([Date]) AS NVARCHAR(2)) AS Fiscal_Period_Of_Year_Name,
       CAST(YEAR([Date]) AS NVARCHAR(4)) + '-' + CAST(MONTH([Date]) AS NVARCHAR(2)) AS FY_PD_KEY,

                                                                                                    -- Operational flags
       CASE
           WHEN DATEPART(WEEKDAY, [Date]) IN ( 1, 7 ) THEN
               'N'
           ELSE
               'Y'
       END AS WorkDayFlag,
       'Y' AS ClosedFlag,
       'Y' AS HourPostedFlag,
       CASE
           WHEN DATEPART(WEEKDAY, [Date])
                BETWEEN 2 AND 6 THEN
               'Y'
           ELSE
               'N'
       END AS WeekDayFlag,
       CASE
           WHEN EOMONTH([Date]) = [Date] THEN
               'Y'
           ELSE
               'N'
       END AS LastDayOfMonthFlag,
       CASE
           WHEN DAY([Date]) = 15 THEN
               'Y'
           ELSE
               'N'
       END AS FifteenOfMonthFlag,
       17 AS WorkHours,
       0 AS Last_Two_Fiscal_Weeks_Flag,
       DATEADD(DAY, 1 - DATEPART(WEEKDAY, [Date]), [Date]) AS Posting_Week,
       DATEADD(DAY, 1 - DATEPART(WEEKDAY, [Date]), [Date]) AS Posting_Week_Date
FROM DateSequence
OPTION (MAXRECURSION 0);
```

This script builds one row per day. For production, extend the range (e.g., 2000–2050) and add fiscal year or holiday flags.

---

## 🔑 Step 3: Why It Matters

With this table in place, you unlock:

- Consistent year-over-year comparisons  
- Month-to-date and quarter-to-date calculations  
- Flexible fiscal calendars  
- Faster, more reliable DAX in Power BI  

---

## 🆕 Power BI Calendar Intelligence (2025 Update)

In September 2025, Power BI introduced **calendar-based time intelligence** in DAX — a major leap forward for modeling custom calendars. This feature lets you define **fiscal years, ISO weeks, 4-4-5 retail calendars**, and other business-specific time structures directly in your semantic model.

### 🔍 What’s New
- **Calendar options**: Right-click any date table in Power BI Desktop to access new calendar settings.  
- **Native support**: Define Gregorian, fiscal, or custom calendars without complex DAX or external scripts.  
- **Flexible reporting**: Align visuals and calculations with your organization’s operational calendar.

### 🧠 Why It Matters
Previously, aligning Power BI with fiscal calendars or retail periods required manual DAX logic or external SQL prep. Now, with native calendar support:
- You can **apply business calendars directly** to visuals and time intelligence functions.  
- DAX functions like `TOTALYTD`, `SAMEPERIODLASTYEAR`, and `DATESINPERIOD` now respect your defined calendar.  
- This complements — not replaces — your SQL date table. You still benefit from centralized control and pre-calculated attributes, but now with **calendar-aware DAX** on top.

### ✨ Tip for SQL Modelers
If you’re already using a robust SQL date table, you can **map it to Power BI’s new calendar options** by ensuring it includes:
- A continuous `Date` column  
- Calendar attributes like fiscal year, week number, and period labels  
- A unique key for joins

This lets you retain your enterprise-grade table while unlocking Power BI’s new calendar intelligence features.

---

👉 In a future post, I’ll extend this table with **fiscal year logic** and **holiday flags**, showing how to adapt it for real-world manufacturing analytics scenarios.

## ❓ Frequently Asked Questions

### Why not just use Power BI’s auto date table?
Auto-generated tables are limited and hidden. A dedicated SQL date table gives you **control, transparency, and scalability**.

### How many years should my date table cover?
Best practice is at least **10 years back and 10 years forward** from today, depending on your reporting needs.

### Can I add fiscal years and holidays?
Yes — extend the table with fiscal year logic, holiday flags, or custom attributes to align with your organization’s reporting calendar.

<!-- Structured Data: FAQ schema for SEO -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why not just use Power BI’s auto date table?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Auto-generated tables are limited and hidden. A dedicated SQL date table gives you control, transparency, and scalability."
      }
    },
    {
      "@type": "Question",
      "name": "How many years should my date table cover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Best practice is at least 10 years back and 10 years forward from today, depending on your reporting needs."
      }
    },
    {
      "@type": "Question",
      "name": "Can I add fiscal years and holidays?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — extend the table with fiscal year logic, holiday flags, or custom attributes to align with your organization’s reporting calendar."
      }
    }
  ]
}
</script>

---

<!-- ## 🔗 Series (Optional)

<nav aria-label="Series navigation">
  <ul>
    <li><a href="/posts/powerbi-hierarchy/">Designing a Division → Org → Program Hierarchy</a></li>
    <li><a href="/posts/date-table-sql/">Building a Robust Date Table for Analytics in SQL</a></li>
  </ul>
</nav> -->
