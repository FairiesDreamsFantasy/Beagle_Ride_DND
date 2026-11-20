<!--
-*- mode: markdown; fill-column: 80; comment-column: 0; -*-
-->

# Application Protection & Editorial Guidelines
# Local Security Sentinel Layer (1999.999999999999% Protection)

## 1. Directory Identity
- **Directory Path**: `.github/workflows/`
- **Scope**: GitHub Actions deployment workflow (`deploy.yml`).

## 2. Hardening Mandates
- **`deploy.yml` is `[LOCKED]`**: Prevent zeroing out, truncation, deletion, or configuration drift.
- Automated deletions, stubbing, simplifications, or unsolicited edits are STRICTLY PROHIBITED.
- Preserve triggers (`Stable`, `main`, `workflow_dispatch`), Node.js build steps, and standalone asset verification routines.
