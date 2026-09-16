# Historical SQL

These files are retained for provenance, not loaded by the CLI migration runner.

- `legacy-migrations/`: all 18 previous repository migration files, unchanged. Most did not use CLI-compatible timestamp names; recorded remote history did not match this folder.
- `legacy-schema.sql`: the previous partial schema, unchanged.
- `remote-migrations/`: SQL statements recorded for the four live migration versions, exported read-only on 2026-09-16.

Do not replay these over the captured baseline: their deployed effects are represented by that snapshot. Production history adoption is complete. See [the database workflow](../README.md) and [the audit](../../DATABASE_AUDIT.md) for deployed changes and remaining cleanup.
