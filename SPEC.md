# Amazon Sponsored Products Bulk Sheet — Column Reference

**Schema version: 2026.05**

The Amazon Sponsored Products bulk-operations sheet is a wide-table format where each row represents one entity (Campaign / Ad Group / Keyword / Product Targeting / Negative / Bidding Adjustment / Product Ad), and the meaning of most columns depends on the row's `Entity` value.

This document describes each column's name, type, format, when it's required, when it's ignored, and any value constraints Amazon enforces server-side.

## Header row

The first row of the sheet is the header. Column names are case-sensitive and must appear in any order. All 30 columns should be present even when empty for the row's record type — Amazon's parser tolerates extra blank columns but rejects unknown column names.

## Record types

The `Entity` column drives row interpretation. Valid values:

| Entity | What it represents | Required identifying column(s) |
|---|---|---|
| `Campaign` | A Sponsored Products campaign | `Campaign Name` |
| `Bidding Adjustment` | Per-placement bid modifier on a campaign | `Campaign Name`, `Placement`, `Percentage` |
| `Ad Group` | An ad group inside a campaign | `Campaign Name`, `Ad Group Name` |
| `Product Ad` | An ASIN/SKU advertised inside an ad group | `Campaign Name`, `Ad Group Name`, `sku` or `asin` |
| `Keyword` | A keyword target | `Campaign Name`, `Ad Group Name`, `Keyword Text`, `Match Type` |
| `Product Targeting` | An ASIN/category targeting expression | `Campaign Name`, `Ad Group Name`, `Product Targeting Expression` |
| `Negative Keyword` | A negative keyword target (ad-group level) | `Campaign Name`, `Ad Group Name`, `Keyword Text`, `Match Type` |
| `Campaign Negative Keyword` | A negative keyword target (campaign level) | `Campaign Name`, `Keyword Text`, `Match Type` |
| `Negative Product Targeting` | An ASIN/brand exclusion expression | `Campaign Name`, `Ad Group Name`, `Product Targeting Expression` |

Some accounts may also see entity types `Audience` and `Sponsored Brands Bid Optimization` — out of scope for Sponsored Products bulk operations.

## The 30 columns

### Identification (3)

| Column | Type | Required | Notes |
|---|---|---|---|
| `Product` | string | always | Always literal `Sponsored Products` for this sheet type. Other Amazon Ads bulk sheets use `Sponsored Brands`, `Sponsored Display` |
| `Entity` | enum | always | One of the record types above |
| `Operation` | enum | always | `Create` \| `Update` \| `Archive`. `Pause` is *not* an Operation — it's `Update` with `State = paused` |

### Foreign-key IDs (6) — used for `Update` / `Archive` of existing rows

| Column | Type | When required | Notes |
|---|---|---|---|
| `Campaign Id` | string (numeric) | When `Operation` is `Update` or `Archive` and updating by ID | Returned by Amazon after first `Create` upload. Optional if you uniquely identify by `Campaign Name` |
| `Ad Group Id` | string (numeric) | Same as above for ad-group operations | |
| `Portfolio Id` | string (numeric) | Optional | Assigns the campaign to a portfolio (campaign group). Empty = no portfolio |
| `Ad Id` | string (numeric) | For Product Ad updates by ID | |
| `Keyword Id` | string (numeric) | For Keyword updates by ID | |
| `Product Targeting Id` | string (numeric) | For Product Targeting updates by ID | |

### Names (2) — primary natural keys

| Column | Type | When required | Constraints |
|---|---|---|---|
| `Campaign Name` | string | All entities | Max 128 chars. Cannot start with whitespace. Must be unique per Amazon advertiser account for new campaigns |
| `Ad Group Name` | string | All entities except `Campaign` and `Campaign Negative Keyword` | Max 128 chars. Must be unique within the parent campaign |

### Campaign config (5)

| Column | Type | When required | Constraints / format |
|---|---|---|---|
| `Start Date` | date | Required for `Campaign` `Create` | Format: `YYYYMMDD` (no separators). Example: `20260507`. Must be today or future |
| `End Date` | date | Optional | Same format. Empty = no end date. If set, must be after `Start Date` |
| `Targeting Type` | enum | Required for `Campaign` `Create` | `Manual` (you pick keywords/products) \| `Auto` (Amazon picks) |
| `State` | enum | Required for `Create` | `enabled` \| `paused` \| `archived`. Lowercase exact |
| `Daily Budget` | number | Required for `Campaign` `Create` | $1.00 – $1,000,000.00. Two-decimal precision. Currency = account default |

### Bidding & inventory (4)

| Column | Type | Used by | Constraints |
|---|---|---|---|
| `sku` | string | `Product Ad` rows | Max 64 chars. Either `sku` OR `asin` per row, not both |
| `asin` | string | `Product Ad` rows | 10 chars, starts with `B0` for most marketplaces |
| `Ad Group Default Bid` | number | `Ad Group` rows | $0.02 – $1,000.00. Floor for keyword bids in this group |
| `Bid` | number | `Keyword`, `Product Targeting`, `Product Ad` rows | $0.02 – $1,000.00. Empty = use ad group default |

### Targeting (3)

| Column | Type | Used by | Notes |
|---|---|---|---|
| `Keyword Text` | string | `Keyword`, `Negative Keyword`, `Campaign Negative Keyword` | Max 256 chars. Lowercase recommended. Multi-word allowed (interpretation depends on `Match Type`) |
| `Match Type` | enum | All keyword rows | `exact` \| `phrase` \| `broad` \| `negativeExact` \| `negativePhrase`. **Case-sensitive lowercase, no spaces** |
| `Product Targeting Expression` | string | `Product Targeting`, `Negative Product Targeting` | Amazon expression syntax (e.g. `asin="B0XXXXXXX"`, `category="3017941011" brand-not="HyperX"`). See [Product Targeting docs](./docs/product-targeting.md) |

### Campaign-level bidding strategy (3)

| Column | Type | Used by | Constraints |
|---|---|---|---|
| `Bidding Strategy` | enum | `Campaign` rows | `Dynamic bids - down only` \| `Dynamic bids - up and down` \| `Fixed bids`. Exact spelling including hyphens |
| `Placement` | enum | `Bidding Adjustment` rows | `placement top` \| `placement rest of search` \| `placement product page`. Lowercase |
| `Percentage` | integer | `Bidding Adjustment` rows | `0` – `900`. Whole percent. `0` = no adjustment, `100` = double bid for that placement |

### Brand Tailored Promotions (4) — shipped 2024-2025

| Column | Type | Used by | Notes |
|---|---|---|---|
| `Audience Id` | string (numeric) | `Audience`-targeted rows | Reference to a saved Audience definition. Out of scope for most bulk-operation use cases |
| `Shopper Cohort Percentage` | integer | Brand Tailored Promotion rows | `0` – `100`. Discount percentage for the targeted shopper segment |
| `Shopper Cohort Type` | enum | Brand Tailored Promotion rows | `BRAND_FOLLOWERS` \| `REPEAT_CUSTOMERS` \| `HIGH_VALUE_CUSTOMERS` \| `RECENT_CUSTOMERS` \| `CART_ABANDONERS` |
| `Sites` | string | Multi-marketplace rows | Comma-separated marketplace codes. Empty = current marketplace only |

## Common rejection patterns

Amazon's parser is strict. The most common upload failures from third-party tools:

1. **`Match Type` capitalized** (`Exact` instead of `exact`) — silently rejects the row
2. **`Start Date` with separators** (`2026-05-07` instead of `20260507`)
3. **`State` capitalized** (`Enabled` instead of `enabled`)
4. **Both `sku` and `asin` populated** on the same Product Ad row — pick one
5. **`Daily Budget` below $1.00** — Amazon rejects with no helpful error
6. **`Campaign Name` over 128 chars** — silently truncated server-side, then duplicate-name conflicts
7. **`Bid` populated on a Negative Keyword row** — should be empty; populated bid causes parser ambiguity
8. **Excel formula injection** — values starting with `=`, `+`, `-`, `@` get interpreted as formulas. Sanitize by prefixing with `'` (apostrophe) or rejecting at the application layer

## Reference implementation

[amztool.me](https://amztool.me) generates bulk sheets from a UI workspace using exactly this schema. Watch the [generate-bulk-sheet tour](https://amztool.me/tour/generate-bulk-sheet) (~10 seconds) to see the column mapping in action.

## Source of truth

Where this spec disagrees with reality (Amazon changed something we haven't tracked yet), Amazon's actual upload behavior wins. Open an issue if you spot drift — that's the most valuable contribution to this repo.

This spec is independently maintained. It is not affiliated with or endorsed by Amazon.com, Inc.
