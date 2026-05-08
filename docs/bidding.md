# Bidding Strategy

The `Bidding Strategy` column on `Campaign` rows controls how Amazon dynamically adjusts your keyword bids in real time, before each auction.

| Value (exact spelling) | What Amazon does to your bid | Best for |
|---|---|---|
| `Dynamic bids - down only` | Lowers in real time when conversion looks unlikely; never raises | Profit-focused campaigns where ACOS control matters more than top placement |
| `Dynamic bids - up and down` | Lowers when unlikely to convert AND raises (up to +100% top-of-search, +50% other placements) when likely | Ranking pushes / launch campaigns where you want top placement on high-intent queries |
| `Fixed bids` | Uses your stated bid every time, no real-time adjustment | Test campaigns / when you need predictable spend per click |

The hyphens and spaces in the value are required exactly as shown. Amazon's parser is strict.

## How "up and down" actually adjusts

Amazon doesn't publish exact multipliers, but the practical envelope:

- **Top of search**: up to **+100%** (your bid can double)
- **Rest of search**: up to **+50%**
- **Product pages**: up to **+50%**
- **Down**: no published floor — Amazon may bid as low as $0.02 if conversion looks unlikely

The downward adjustment is more aggressive than the upward. A "Dynamic up and down" campaign on a marginal keyword will often bid lower on average than a "Fixed" campaign with the same stated bid.

## Interaction with `Bidding Adjustment` rows

`Bidding Adjustment` rows are a **separate, additive** mechanism on top of the bidding strategy:

```
Campaign sets:  Bidding Strategy = Dynamic bids - up and down
              + Bidding Adjustment row with Placement = placement top, Percentage = 50
```

The 50% placement adjustment is applied first to your stated bid, then the dynamic bidding strategy applies its real-time multiplier. Effective top-of-search bid range becomes roughly `0.02 ↔ stated_bid × 1.5 × 2.0`.

## When to set `Bid` vs `Ad Group Default Bid`

- Leave `Bid` empty on `Keyword` / `Product Targeting` rows → Amazon uses `Ad Group Default Bid`
- Set `Bid` explicitly only when you want this keyword to deviate from the group default

This keeps your bulk sheet maintainable. Group-level bid changes propagate to all keywords with no override; keywords with explicit overrides keep their values.

## What `Bidding Strategy` doesn't do

- It doesn't change which queries you compete in (that's `Match Type`)
- It doesn't change daily budget pacing (Amazon paces independently)
- It doesn't apply to Sponsored Brands or Sponsored Display (their bidding is configured differently)

For practical bidding strategy guidance see [amztool's structure guide](https://amztool.me/blog/amazon-keyword-ranking-campaign-structure) — sections on budget logic and bid logic.
