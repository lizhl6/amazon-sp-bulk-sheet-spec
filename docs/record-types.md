# Record Types

Each row in a Sponsored Products bulk sheet has an `Entity` value that determines how the rest of the row's columns are interpreted. The 9 entity types form a parent-child tree:

```
Campaign
├── Bidding Adjustment              (per-placement bid modifier on the campaign)
├── Campaign Negative Keyword       (negative target at campaign level)
└── Ad Group
    ├── Product Ad                  (the SKU/ASIN being advertised)
    ├── Keyword                     (positive keyword target)
    ├── Negative Keyword            (negative target at ad-group level)
    ├── Product Targeting           (positive ASIN/category target)
    └── Negative Product Targeting  (negative ASIN/brand exclusion)
```

## Upload order matters

Within a single bulk sheet, parents must precede their children. Amazon's parser is lenient about ordering across non-related branches, but a `Keyword` row referencing an `Ad Group Name` that doesn't appear above it will be rejected even if the ad group is created later in the same sheet.

Recommended row order:

1. All `Campaign` rows (one per new campaign)
2. All `Bidding Adjustment` rows (per-placement modifiers, ~3 per campaign max)
3. All `Campaign Negative Keyword` rows (campaign-level negatives)
4. All `Ad Group` rows
5. All `Product Ad` rows
6. All `Keyword` / `Product Targeting` rows
7. All `Negative Keyword` / `Negative Product Targeting` rows

## Identification semantics

For `Create` operations, parent-child relationships are resolved by **name** (`Campaign Name` + `Ad Group Name`). Amazon assigns numeric IDs after upload — those IDs are returned in the post-upload report and become the canonical reference for future `Update` / `Archive` operations.

For `Update` and `Archive`, both forms work:

- **By name**: `Campaign Name` + `Ad Group Name` (omit ID columns) — Amazon resolves to the current ID
- **By ID**: `Campaign Id` + `Ad Group Id` (omit name columns) — direct reference, faster

Mixing them on the same row is allowed but the ID takes precedence if they conflict (and you'll get a warning).

## Operation × Entity matrix

Not all operations apply to all entities. The realistic combinations:

| Entity | Create | Update | Archive |
|---|---|---|---|
| Campaign | ✓ | ✓ | ✓ |
| Bidding Adjustment | ✓ | ✓ | ✓ (sets Percentage to 0) |
| Ad Group | ✓ | ✓ | ✓ |
| Product Ad | ✓ | ✓ (state only) | ✓ |
| Keyword | ✓ | ✓ (Bid + State) | ✓ |
| Product Targeting | ✓ | ✓ (Bid + State) | ✓ |
| Negative Keyword | ✓ | (rare — usually Archive + Create new) | ✓ |
| Campaign Negative Keyword | ✓ | (same) | ✓ |
| Negative Product Targeting | ✓ | (same) | ✓ |

## Pause / Enable / Resume

There is **no `Pause` operation**. To pause anything:

```
Operation = Update
State     = paused
```

To resume:

```
Operation = Update
State     = enabled
```

## Archive vs Delete

Amazon does not actually delete entities. `Archive` hides them from the UI and excludes them from reports going forward. Archived entities cannot be re-enabled — to bring them back, create a new entity with the same configuration.

Bulk-archive an entire campaign by archiving the campaign row only — Amazon cascades the archive to all children automatically. You don't need to archive each ad group / keyword separately (and trying to do so against an already-archived parent returns warnings).

## Common confusions

- **Negative Keyword vs Campaign Negative Keyword**: same thing, different scope. Negative Keyword applies only to one ad group; Campaign Negative Keyword applies to every ad group in that campaign. Use the latter when you have a list of terms (like brand-defense) that should be excluded everywhere
- **Product Ad vs Product Targeting**: opposite directions. Product Ad is *what you're advertising* (your SKU). Product Targeting is *what you're targeting* (a competitor's ASIN, a category)
- **Match Type ≠ Targeting Type**: `Targeting Type` is on the Campaign (`Manual` or `Auto`). `Match Type` is on the Keyword (`exact` / `phrase` / `broad`). They're independent
