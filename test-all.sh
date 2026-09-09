#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
for project in lock election tokenization; do "$ROOT/launch.sh" "$project" --test; done
