#!/bin/bash
# Rebuilds ~/Desktop/CDL_site_upload -- the folder to drag onto Netlify.
#
# It copies every file the site needs and nothing else. The list comes from
# git, so .gitignore is the single place that decides what stays private:
# feedback/, the bio files people submitted, and the photo originals are
# excluded there and so can never reach the upload folder by accident.
#
# Usage:  ./publish.sh

set -e
cd "$(dirname "$0")"
OUT="$HOME/Desktop/CDL_site_upload"

if [ ! -d .git ]; then
  echo "error: run this from the Lab_Website folder (no .git here)" >&2; exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

# --cached      files already committed
# --others      new files not committed yet, so a photo added today still ships
# --exclude-standard   ...but still obeying .gitignore
git ls-files -z --cached --others --exclude-standard | while IFS= read -r -d '' f; do
  [ "$f" = ".gitignore" ] && continue
  [ "$f" = "publish.sh" ] && continue
  mkdir -p "$OUT/$(dirname "$f")"
  cp "$f" "$OUT/$f"
done

# Guard: if any of these ever appear, the exclusions have broken.
for bad in "feedback" ; do
  if [ -e "$OUT/$bad" ]; then echo "STOP: $bad is in the upload folder" >&2; exit 1; fi
done
if find "$OUT" \( -name '*.rtf' -o -name '*.docx' \) | grep -q .; then
  echo "STOP: a bio file reached the upload folder" >&2; exit 1
fi

echo "Ready to upload:  $OUT"
echo "  $(find "$OUT" -type f | wc -l | tr -d ' ') files, $(du -sh "$OUT" | cut -f1)"
echo
echo "Now drag that folder onto the drop zone in your Netlify project's"
echo "Deploys page (log in first, or you will not be able to update it)."
