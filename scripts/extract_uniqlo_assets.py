import re
from pathlib import Path

files = [
    Path("supabase_vton_schema/productdetai.html"),
    Path("supabase_vton_schema/AI vitual try on.html")
]

for f in files:
    if f.exists():
        text = f.read_text(encoding="utf-8", errors="ignore")
        matches = set(re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|mp4)', text))
        uniqlo_matches = [m for m in matches if "uniqlo" in m or "fastretailing" in m]
        print(f"=== {f.name}: {len(uniqlo_matches)} Uniqlo assets found ===")
        for m in sorted(uniqlo_matches)[:25]:
            print(m)
