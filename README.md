# Amazon Sponsored Products Bulk Sheet Spec

> A machine-readable specification of the column schema, entity types, and value constraints for the Amazon Sponsored Products bulk-operations sheet (`.xlsx` / `.csv`).

[![License: CC0-1.0](https://img.shields.io/badge/license-CC0_1.0-lightgrey.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-actively_maintained-brightgreen)
![Schema version](https://img.shields.io/badge/schema-2026.05-blue)

Amazon publishes the bulk-sheet format as a PDF help-center article and a downloadable Excel template. There's no machine-readable spec, no JSON Schema, no programmatic validator. This repo fills that gap.

If you're writing a tool that **generates**, **validates**, **transforms**, or **diffs** Amazon Sponsored Products bulk sheets, this is the reference you wished existed.

## What's in here

| File | Purpose |
|---|---|
| [`SPEC.md`](./SPEC.md) | The full 30-column reference — name, type, required-when, value range, example, notes |
| [`schema/sponsored-products-bulk-sheet.schema.json`](./schema/sponsored-products-bulk-sheet.schema.json) | JSON Schema you can run against parsed CSV rows |
| [`examples/`](./examples/) | Real-shape sample CSVs you can copy into your test fixtures |
| [`docs/record-types.md`](./docs/record-types.md) | The 5 entity types (Campaign / Ad Group / Keyword / Product Targeting / Negative) |
| [`docs/match-types.md`](./docs/match-types.md) | exact / phrase / broad / negativeExact / negativePhrase semantics |
| [`docs/bidding.md`](./docs/bidding.md) | Dynamic bids — up/down, down-only, fixed |
| [`docs/placements.md`](./docs/placements.md) | top-of-search / rest-of-search / product-pages bid adjustments |

## Quick start

### Validate a row in JavaScript (Ajv)

```bash
npm install ajv ajv-formats
```

```js
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from 'amazon-sp-bulk-sheet-spec/schema/sponsored-products-bulk-sheet.schema.json'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const row = {
  Product: 'Sponsored Products',
  Entity: 'Keyword',
  Operation: 'Create',
  'Campaign Name': 'Wireless Mouse - Hero',
  'Ad Group Name': 'Hero - Exact',
  'Keyword Text': 'wireless ergonomic mouse',
  'Match Type': 'exact',
  Bid: 0.85,
  State: 'enabled',
}

if (!validate(row)) console.log(validate.errors)
```

### Parse a real bulk sheet in Python

```python
import csv, json, jsonschema

with open('schema/sponsored-products-bulk-sheet.schema.json') as f:
    schema = json.load(f)

with open('your-bulk-sheet.csv') as f:
    for row in csv.DictReader(f):
        try:
            jsonschema.validate(row, schema)
        except jsonschema.ValidationError as e:
            print(f"Row {row.get('Campaign Name')}: {e.message}")
```

## The 30 columns at a glance

```
Product · Entity · Operation
Campaign Id · Ad Group Id · Portfolio Id · Ad Id · Keyword Id · Product Targeting Id
Campaign Name · Ad Group Name
Start Date · End Date · Targeting Type · State · Daily Budget
sku · asin · Ad Group Default Bid · Bid
Keyword Text · Match Type
Bidding Strategy · Placement · Percentage
Product Targeting Expression
Audience Id · Shopper Cohort Percentage · Shopper Cohort Type · Sites
```

Each column's exact meaning, type, requirements, and edge cases — see [`SPEC.md`](./SPEC.md).

## Why this exists

Amazon's bulk-operations format is the upload contract used by every Amazon Ads tool — campaign builders, bid managers, reporting tools, account auditors. Yet:

- The format spec lives only in a PDF that gets edited without changelog
- Templates ship as `.xlsx` with no version metadata
- There's no validator. Errors surface only after Amazon rejects an upload — sometimes minutes after, sometimes hours
- Five record types (Campaign / Ad Group / Keyword / Product Targeting / Negative) share one wide table with conditional column requirements per type, easy to get wrong

This repo is **pure documentation + schema**. It carries no Amazon copyrighted material. It's an independent description of an open data format, similar in spirit to how OpenAPI Spec describes the broader REST world.

## Versioning

Amazon adds columns occasionally (most recently `Audience Id`, `Shopper Cohort Percentage`, `Shopper Cohort Type`, `Sites` for Brand Tailored Promotions). This repo tracks those changes via the `CHANGELOG.md` and tagged releases.

Schema version naming follows Amazon's effective-date pattern: `YYYY.MM`.

Current: **2026.05**

## Contributing

Spotted a column behavior the spec gets wrong? An undocumented edge case? A new field Amazon shipped? Open an issue or PR. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Live demo

Want to see this spec implemented as a working tool — generating a real bulk sheet from a clean UI?

→ **[amztool.me](https://amztool.me)** — interactive demo at [`/how-it-works`](https://amztool.me/how-it-works), no signup needed.

The reference implementation uses this exact schema. Watching the demo is the fastest way to see how the column semantics translate to a real ad-ops workflow.

## License

[CC0-1.0](LICENSE) — public domain dedication. Use, fork, embed, redistribute. No attribution required (though it's appreciated).

The spec describes Amazon's format. It does not include Amazon copyrighted material — only the structural description of a data format used by third-party tools.

## Related

- Amazon Ads documentation (PDF): https://advertising.amazon.com/help/G3JFQTH3FFKCNXMV
- Amazon Ads API: https://advertising.amazon.com/API/docs/
- amztool.me — open-web bulk sheet generator built on this spec
