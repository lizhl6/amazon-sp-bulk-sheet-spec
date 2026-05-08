# Sample Bulk Sheets

Real-shape examples you can drop into your test fixtures or open in Excel.

## Files

| File | Rows | What's covered |
|---|---|---|
| `minimal.csv` | 8 | One Manual campaign · one ad group · one Product Ad (SKU) · 3 keywords (1 exact + 2 phrase) · 1 negative keyword · 1 placement bid adjustment |
| `multi-record-types.csv` | 18 | Two campaigns (Manual + Auto) · all 9 entity types · 2 placement adjustments · 2 product-targeting expressions · campaign-level negative · negative product targeting |

## Validate them

```bash
# Using ajv-cli + node
npx ajv-cli validate \
  -s ../schema/sponsored-products-bulk-sheet.schema.json \
  -d minimal.csv \
  --csv
```

```python
# Using jsonschema in Python
import csv, json, jsonschema

with open('../schema/sponsored-products-bulk-sheet.schema.json') as f:
    schema = json.load(f)

with open('minimal.csv') as f:
    for i, row in enumerate(csv.DictReader(f), start=2):
        # CSV reads everything as strings; coerce numeric columns
        for k in ('Daily Budget', 'Ad Group Default Bid', 'Bid'):
            if row.get(k):
                row[k] = float(row[k])
        for k in ('Percentage', 'Shopper Cohort Percentage'):
            if row.get(k):
                row[k] = int(row[k])
        # Empty strings → null for nullable fields
        row = {k: (v if v != '' else None) for k, v in row.items()}
        try:
            jsonschema.validate(row, schema)
        except jsonschema.ValidationError as e:
            print(f"row {i} ({row.get('Entity')}): {e.message}")
```

## What `minimal.csv` actually does on Amazon

When uploaded to a Sponsored Products account, this sheet:

1. Creates a campaign `Wireless Mouse - Hero` with $25/day budget, dynamic up-and-down bidding, starting today
2. Adds +50% bid boost on top-of-search placement
3. Creates an ad group `Hero ASIN - Exact` with $0.85 default bid
4. Advertises SKU `WM-BLK-001` in that ad group
5. Targets 3 keywords (exact + 2 phrase) at $0.85 each
6. Excludes the search term `gaming mouse` from this ad group

Total time to upload + go live: ~5 minutes from upload to first impression eligibility.

## Notes for parser authors

- Empty cells are preserved as empty strings in CSV — your validator needs to coerce them to `null` before schema check, otherwise enum validators will fail on `""` for nullable string columns
- `sku` column is lowercase in the official template (Amazon's inconsistency, not ours)
- The schema uses `"const": "Sponsored Products"` for the `Product` column — this rejects sheets pasted from Sponsored Brands or Sponsored Display templates, which is intentional
