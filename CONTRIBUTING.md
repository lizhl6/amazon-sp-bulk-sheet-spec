# Contributing

The most valuable contributions to this repo are **drift reports**: places where what the spec says diverges from what Amazon's bulk-uploader actually does. If you've recently uploaded a sheet and Amazon rejected or silently mutated something the spec says is fine, please tell us.

## How to report drift

Open an issue with this template:

```
**Schema version checked against:** 2026.05
**Marketplace:** US / EU / JP / etc.
**Entity / column:** e.g. `Keyword.Match Type`
**What spec says:** e.g. "exact / phrase / broad (lowercase)"
**What Amazon actually accepts:** e.g. "Exact, Phrase, Broad (capitalized) — silently mutated to lowercase"
**Repro steps:** the minimum row + Operation that triggers the discrepancy
**Source:** Amazon error message / Seller Central screenshot / API response
```

## Adding a new column

Amazon ships new columns occasionally. When that happens:

1. Update [`SPEC.md`](./SPEC.md) — add a row to the appropriate section table
2. Update [`schema/sponsored-products-bulk-sheet.schema.json`](./schema/sponsored-products-bulk-sheet.schema.json) — add the property + any conditional logic to `allOf`
3. Update [`examples/`](./examples/) — bump the column count in `multi-record-types.csv` (add an empty column even if the example doesn't use it)
4. Bump the schema version in `SPEC.md` header to the current `YYYY.MM`
5. Add a `CHANGELOG.md` entry

## What we don't accept

- **PRs that include Amazon-copyrighted content** (screenshots of Seller Central UI, copy-pasted help center text, official template files). The spec is independent prose describing the format
- **Marketplace-specific assumptions** — most of the format is global, but bid floors / currency precision differ. Document differences in `docs/marketplaces.md` rather than hardcoding US-only values
- **Tool-specific conventions** — this is Amazon's format, not your tool's house style

## Local validation

```bash
# Validate the JSON Schema is itself well-formed
npx ajv-cli compile -s schema/sponsored-products-bulk-sheet.schema.json

# Validate the example CSVs against the schema
npx ajv-cli validate -s schema/sponsored-products-bulk-sheet.schema.json -d examples/minimal.csv --csv
```

CI runs both checks on every PR. PRs failing validation are auto-flagged.

## Commit style

Conventional Commits, lowercase scope:

```
docs(spec): clarify Negative Keyword Bid behavior
fix(schema): allow empty Sites column for single-marketplace accounts
feat(examples): add Brand Tailored Promotions sample
chore(ci): bump ajv-cli to v5
```

## License

By contributing you agree your contribution is dedicated to the public domain under [CC0-1.0](LICENSE).
