#!/usr/bin/env bash
#
#   npm run release            # auto-bump the patch version
#   npm run release 0.2.0      # cut an explicit version
#   npm run release -- -y      # auto-bump, skip the confirmation prompt
#
set -euo pipefail

ASSUME_YES=0
VERSION=""

for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=1 ;;
    *) VERSION="$arg" ;;
  esac
done

die() { echo "error: $*" >&2; exit 1; }

# Each of these has burned someone before: releasing a dirty tree ships
# uncommitted code, releasing off main tags the wrong commit, and releasing
# behind origin drops other people's work out of the tag.
[ -z "$(git status --porcelain)" ] || die "working tree is not clean"
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || die "not on main"
git fetch --quiet origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || die "main is not in sync with origin/main"

CURRENT=$(node -p "require('./package.json').version")

if [ -z "$VERSION" ]; then
  VERSION=$(node -p "const [a,b,c]=require('./package.json').version.split('.');[a,b,Number(c)+1].join('.')")
fi

[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "invalid version: $VERSION"
! git rev-parse "v$VERSION" >/dev/null 2>&1 || die "tag v$VERSION already exists"

echo "  $CURRENT -> $VERSION"
if [ "$ASSUME_YES" -eq 0 ]; then
  read -r -p "  Proceed? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || die "aborted"
fi

# -i.bak keeps this portable across BSD (macOS) and GNU sed.
sed -i.bak -E "s/\"version\": \"$CURRENT\"/\"version\": \"$VERSION\"/" package.json
rm -f package.json.bak

git add package.json
git commit -m "chore(release): v$VERSION"
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"

echo "  released v$VERSION"
