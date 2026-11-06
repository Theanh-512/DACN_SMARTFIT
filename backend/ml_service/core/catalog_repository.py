import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.schemas.garment_catalog import GarmentProductSchema, GarmentVariantSchema, GarmentAssetSchema
from core.storage_service import StorageService

logger = logging.getLogger("ml_service.catalog_repository")

CATALOG_DB_FILE = os.path.join(StorageService.get_durable_dir(), "catalog.json")

class CatalogRepository:
    """
    Persistent Repository for GarmentProduct, GarmentVariant, and GarmentAsset.
    Stores metadata in durable storage (JSON database) and synchronizes to frontend.
    """

    @classmethod
    def _load_data(cls) -> Dict[str, Any]:
        if os.path.exists(CATALOG_DB_FILE):
            try:
                with open(CATALOG_DB_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error loading catalog db: {e}")
        return {"products": []}

    @classmethod
    def _save_data(cls, data: Dict[str, Any]) -> None:
        os.makedirs(os.path.dirname(CATALOG_DB_FILE), exist_ok=True)
        with open(CATALOG_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # Synchronize with frontend public assets
        StorageService.save_bytes(
            "catalog/products.json",
            json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        )

    @classmethod
    def initialize_seeds_if_empty(cls) -> None:
        """Initializes default verified Phase 4 sample products into persistent catalog if not yet present."""
        data = cls._load_data()
        existing_ids = {p.get("product_id") for p in data.get("products", [])}

        seeds_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "assets", "products"
        )
        if not os.path.exists(seeds_dir):
            return

        added = False
        for f in os.listdir(seeds_dir):
            if f.endswith(".json") and not f.startswith("."):
                try:
                    with open(os.path.join(seeds_dir, f), "r", encoding="utf-8") as fp:
                        spec = json.load(fp)
                    pid = spec.get("product_id")
                    if pid and pid not in existing_ids:
                        now_str = datetime.now(timezone.utc).isoformat()
                        variants = []
                        assets = []
                        for sz, m in spec.get("sizes", {}).items():
                            vid = f"var_{pid}_{sz.lower()}"
                            glb_url = f"/assets/garments/{pid}_{sz.lower()}.glb"
                            asset_id = f"ast_{pid}_{sz.lower()}_glb"
                            ast = GarmentAssetSchema(
                                asset_id=asset_id,
                                product_id=pid,
                                variant_id=vid,
                                size=sz,
                                asset_type="glb_skinned",
                                asset_version=1,
                                storage_path=f"garments/{pid}/sizes/{sz}/garment-v1.glb",
                                public_url=glb_url,
                                checksum="",
                                generation_mode="pushout",
                                rigging_compatibility="SMPL_24_JOINT_RIG",
                                validation_status="passed",
                                created_at=now_str
                            )
                            assets.append(ast)
                            variants.append(GarmentVariantSchema(
                                variant_id=vid,
                                product_id=pid,
                                size=sz,
                                measurements=m,
                                stretch_pct=spec.get("fabric", {}).get("stretch_pct", 15.0),
                                thickness_mm=spec.get("fabric", {}).get("thickness_mm", 1.5),
                                generation_status="ready",
                                assets=[ast],
                                fitting_diagnostics={"is_tight": False, "ease_chest_cm": 6.0}
                            ))

                        prod = GarmentProductSchema(
                            product_id=pid,
                            sku=f"SKU-{pid.upper()}",
                            name=spec.get("name", "Sample Garment"),
                            category=spec.get("category", "tshirt"),
                            description=spec.get("description", "Sản phẩm 3D chất lượng cao chuẩn ISO 8559."),
                            status="published",
                            material=spec.get("fabric", {}).get("material", "Cotton"),
                            stretch_pct=spec.get("fabric", {}).get("stretch_pct", 15.0),
                            thickness_mm=spec.get("fabric", {}).get("thickness_mm", 1.5),
                            primary_color_hex=spec.get("color_hex", "#19284B"),
                            pattern_description=None,
                            design_notes=spec.get("note", None),
                            image_front_url=spec.get("image_front", f"/assets/products/{pid}_front.png"),
                            created_at=now_str,
                            updated_at=now_str,
                            variants=variants,
                            assets=assets
                        )
                        data.setdefault("products", []).append(prod.model_dump())
                        added = True
                        existing_ids.add(pid)
                except Exception as e:
                    logger.warning(f"Error seeding product {f}: {e}")

        if added:
            cls._save_data(data)

    @classmethod
    def get_all(cls, published_only: bool = True) -> List[Dict[str, Any]]:
        cls.initialize_seeds_if_empty()
        data = cls._load_data()
        prods = data.get("products", [])
        if published_only:
            return [p for p in prods if p.get("status") == "published"]
        return prods

    @classmethod
    def get_by_id(cls, product_id: str) -> Optional[Dict[str, Any]]:
        cls.initialize_seeds_if_empty()
        data = cls._load_data()
        for p in data.get("products", []):
            if p.get("product_id") == product_id:
                return p
        return None

    @classmethod
    def save(cls, product: GarmentProductSchema) -> GarmentProductSchema:
        cls.initialize_seeds_if_empty()
        data = cls._load_data()
        prods = data.get("products", [])
        updated = False
        prod_dict = product.model_dump()
        prod_dict["updated_at"] = datetime.now(timezone.utc).isoformat()

        for idx, p in enumerate(prods):
            if p.get("product_id") == product.product_id:
                prods[idx] = prod_dict
                updated = True
                break

        if not updated:
            if not prod_dict.get("created_at"):
                prod_dict["created_at"] = prod_dict["updated_at"]
            prods.append(prod_dict)

        data["products"] = prods
        cls._save_data(data)

        # Also save individual product.json in product durable folder
        prod_folder_rel = f"garments/{product.product_id}/product.json"
        StorageService.save_bytes(
            prod_folder_rel,
            json.dumps(prod_dict, ensure_ascii=False, indent=2).encode("utf-8")
        )

        return product

    @classmethod
    def delete(cls, product_id: str) -> bool:
        data = cls._load_data()
        prods = data.get("products", [])
        new_prods = [p for p in prods if p.get("product_id") != product_id]
        if len(new_prods) != len(prods):
            data["products"] = new_prods
            cls._save_data(data)
            return True
        return False
