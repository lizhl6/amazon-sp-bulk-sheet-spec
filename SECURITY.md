# Security Policy

This repository ships **documentation, JSON Schema, and sample CSVs** — no executable code paths in production. Security risk surface is small but non-zero (the validation script in `scripts/` runs `node` locally).

## Reporting a vulnerability

If you discover a security issue, please **do not open a public issue**. Use GitHub's private security advisory channel:

→ **[Report a vulnerability](https://github.com/lizhl6/amazon-sp-bulk-sheet-spec/security/advisories/new)**

This routes the report to the maintainer privately, lets us coordinate a fix before public disclosure, and creates an audit trail tied to the eventual CVE (if applicable).

Include:

- Summary of the issue
- Reproduction steps
- Affected version (commit SHA / release tag)
- Your suggested fix if you have one

I aim to acknowledge within 72 hours and ship a fix or mitigation within 14 days for high-severity issues.

## What counts as a vulnerability here

- **In-scope**: bugs in `scripts/validate-examples.mjs` that could be exploited by a malicious CSV input (path traversal, regex DoS, prototype pollution); supply-chain issues in declared `devDependencies`; injection vectors in CI workflow
- **Out-of-scope**: Amazon Ads server-side bugs (report those to Amazon); typos in `SPEC.md`; spec drift from current Amazon behavior (open a normal issue instead)

## Supply chain

- All dependencies are dev-only (`ajv`, `ajv-cli`, `ajv-formats`)
- `package-lock.json` is committed for reproducible installs
- CI runs on `ubuntu-latest` with Node 20 LTS
- `npm install` runs in clean GitHub-hosted runners; no self-hosted runners

## Past advisories

None to date. This file will be updated when the first one ships.
