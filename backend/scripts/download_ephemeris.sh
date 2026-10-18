#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/../data/ephemeris" && pwd)"
mkdir -p "$DIR"
BASE="https://github.com/aloistr/swisseph/raw/master/ephe"
cd "$DIR"
for f in sepl_18.se1 semo_18.se1 seas_18.se1 seplm48.se1 semom48.se1 seasm48.se1 sepl_12.se1 semo_12.se1 seas_12.se1; do
  if [[ -f "$f" ]]; then echo "exists $f"; continue; fi
  echo "Downloading $f…"
  curl -fsSL -o "$f" "$BASE/$f"
done
echo "Ephemeris ready in $DIR"
