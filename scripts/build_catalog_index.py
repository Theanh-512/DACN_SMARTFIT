import os
import sys
import json
import re

# Add ai-service to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AI_SERVICE_DIR = os.path.join(BASE_DIR, "ai-service")
sys.path.insert(0, AI_SERVICE_DIR)
sys.stdout.reconfigure(encoding='utf-8')

from app.visual_search.catalog_indexer import CatalogVisualIndexer

def extract_products_from_mock():
    mock_file = os.path.join(BASE_DIR, "frontend", "fashion-ai-web", "src", "app", "core", "data", "mock-products.ts")
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()

    start = content.find("export const MOCK_PRODUCTS: Product[] = [")
    if start == -1:
        raise ValueError("Could not find MOCK_PRODUCTS in mock-products.ts")

    sub = content[start + len("export const MOCK_PRODUCTS: Product[] = ["):]
    bracket_depth = 1
    end = 0
    for i, ch in enumerate(sub):
        if ch == '[':
            bracket_depth += 1
        elif ch == ']':
            bracket_depth -= 1
            if bracket_depth == 0:
                end = i
                break

    raw_array = '[' + sub[:end] + ']'
    raw_array = re.sub(r',\s*([\]}])', r'\1', raw_array)
    prods = json.loads(raw_array)
    return prods

def main():
    print("=" * 60)
    print("TRÍCH XUẤT VÀ LẬP CHỈ MỤC EMBEDDING CHO DANH MỤC SẢN PHẨM")
    print("=" * 60)
    
    prods = extract_products_from_mock()
    print(f"-> Đã trích xuất {len(prods)} sản phẩm từ frontend catalog.")
    
    indexer = CatalogVisualIndexer.get_instance()
    count = indexer.build_index_from_catalog(prods)
    print(f"-> Hoàn tất lập chỉ mục cho {count} sản phẩm tại: {indexer.data_dir}")

if __name__ == "__main__":
    main()
