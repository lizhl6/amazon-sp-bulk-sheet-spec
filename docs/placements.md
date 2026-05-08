# Placement Bid Adjustments

Amazon places Sponsored Products ads in three positions across the shopping experience. The `Placement` + `Percentage` columns on a `Bidding Adjustment` row let you bid more (or less) per placement.

## The three placements

| `Placement` value (exact lowercase) | Where ads appear | Typical CTR / CVR |
|---|---|---|
| `placement top` | Top-of-search results page (above organic listings) | Highest CTR + CVR. Most expensive |
| `placement rest of search` | Mid/bottom of search results page (mixed with organic) | Mid CTR + CVR |
| `placement product page` | "Sponsored products related to this item" carousel on PDPs | Lowest CTR overall but high purchase-intent traffic |

## Percentage range

`Percentage` is an integer `0` – `900`:

- `0` = no adjustment, bid as-is
- `50` = +50% bid for that placement
- `100` = double bid (200% of original)
- `900` = 10x bid (rare, only for high-value top-of-search pushes)

Negative adjustments are not supported. To bid less on a placement, lower your base `Bid` and adjust other placements upward instead.

## Example

```csv
Entity,Operation,Campaign Name,Placement,Percentage
Bidding Adjustment,Create,WM-2026-Q2-Manual,placement top,75
Bidding Adjustment,Create,WM-2026-Q2-Manual,placement product page,25
```

Effect: top-of-search bids are 75% higher than your stated keyword bid; product-page bids are 25% higher; rest-of-search uses your stated bid as-is (no row = 0% adjustment).

## Combining with bidding strategy

Placement adjustment applies **first**, then the campaign's bidding strategy multiplier:

```
effective_bid = stated_bid × (1 + placement_pct/100) × dynamic_bid_multiplier
```

A keyword bid of $0.85 with `+75%` top adjustment under `Dynamic bids - up and down` can effectively bid up to:

```
0.85 × 1.75 × 2.0 = $2.97  (top of search, peak dynamic adjustment)
```

This is why aggressive top-of-search adjustments need careful budget supervision — actual bids can exceed your stated value by 3-4x.

## Which placement to push

Conventional wisdom in 2025:

- **Top of search** for ranking pushes (discovery + conversion compound)
- **Product page** for cross-sell / conquest plays (you're shown next to a competitor's product)
- **Rest of search** rarely worth a positive adjustment — usually leave at 0

For the strategic side see [amztool's campaign structure guide](https://amztool.me/blog/amazon-keyword-ranking-campaign-structure).
