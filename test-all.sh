#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
node --test "$ROOT/test/runtime.test.mjs"
for project in lock election tokenization; do "$ROOT/launch.sh" "$project" --test; done
