# Match Types

The `Match Type` column controls how a keyword's text is compared against shopper search queries. Five valid values, all **lowercase, no spaces** — capitalization is the #1 cause of silent row rejection.

| Value | What it matches | Use when |
|---|---|---|
| `exact` | The exact phrase + plurals + close variants (e.g. "running shoe" vs "running shoes") | You've validated the keyword converts and want concentrated bid on it |
| `phrase` | The phrase appears in shopper query, in order, surrounded by other words | You want some variation tolerance but ordering matters ("blue running shoe" but not "shoe running blue") |
| `broad` | Any combination of the words in the phrase, including synonyms and related terms | Discovery — finding new variations of how shoppers search |
| `negativeExact` | Block exact matches of the negative phrase | Block specific competitor terms or brand confusion |
| `negativePhrase` | Block any query containing the negative phrase | Block whole categories ("free shipping", "wholesale", "gaming") |

## How Amazon compares the text

Amazon does not normalize beyond lowercasing and basic punctuation stripping. These are treated as different keywords:

- `wireless mouse`
- `wireless mouse usb`
- `usb wireless mouse`

But these are merged (close variant):

- `wireless mouse` ↔ `wireless mice` (singular/plural)
- `wireless mouse` ↔ `wireless-mouse` (hyphen)
- Tense variations (recent shift): `running shoes` ↔ `runs shoes` (Amazon now treats minor tense changes as same exact match)

## Negative match types and `Bid`

Negative keyword rows must have an empty `Bid` column. Populating `Bid` on a `Negative Keyword` or `Campaign Negative Keyword` row causes parser ambiguity — some marketplaces reject the row, others silently ignore the bid and create the negative.

## Match type strategy briefly

1. **Auto campaign discovers** terms shoppers use → check Search Term Report
2. **Broad / Phrase keyword** in a Manual campaign confirms the term converts → identify winners
3. **Exact match keyword** concentrates spend on the validated term → drive ranking + efficient ROAS
4. **Negative phrase** strips off intent that doesn't fit your product → keep traffic clean

This is the workflow most professional Amazon advertisers use. The bulk sheet is the data layer — the strategy decisions sit on top.

For the strategic side, see [amztool's keyword ranking campaign structure guide](https://amztool.me/blog/amazon-keyword-ranking-campaign-structure).
