-- ============================================================================
-- SEED SCRIPT: Scraped Real UNIQLO Products (166 items + variants)
-- Compatible with Supabase PostgreSQL ecommerce_vton schema
-- ============================================================================

-- 1. Ensure categories exist
INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-jackets', 'Áo Khoác', 'ao-khoac', 'Bộ sưu tập Áo Khoác LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-fleece', 'Áo Lông Cừu', 'ao-long-cuu', 'Bộ sưu tập Áo Lông Cừu LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-tshirts', 'Áo Thun', 'ao-thun', 'Bộ sưu tập Áo Thun LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-shirts', 'Sơ Mi', 'so-mi', 'Bộ sưu tập Sơ Mi LifeWear Uniqlo chính hãng', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-pants', 'Quần Dài', 'quan-dai', 'Bộ sưu tập Quần Dài LifeWear Uniqlo chính hãng', 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-jeans', 'Quần Jeans', 'quan-jeans', 'Bộ sưu tập Quần Jeans LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-dresses', 'Đầm & Váy', 'dam-vay', 'Bộ sưu tập Đầm & Váy LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-loungewear', 'Đồ Mặc Nhà', 'do-mac-nha', 'Bộ sưu tập Đồ Mặc Nhà LifeWear Uniqlo chính hãng', 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-innerwear', 'Đồ Lót & AIRism', 'do-lot-airism', 'Bộ sưu tập Đồ Lót & AIRism LifeWear Uniqlo chính hãng', 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

INSERT INTO public.categories (id, name, slug, description, image_url, is_active)
VALUES ('cat-accessories', 'Phụ Kiện', 'phu-kien', 'Bộ sưu tập Phụ Kiện LifeWear Uniqlo chính hãng', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;


-- 2. Insert Products
INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('prod-001', 'Áo Cardigan Vải Gân Cổ V | Flower', 'ao-cardigan-vai-gan-co-v-flower-489399', 'Áo Cardigan Vải Gân Cổ V | Flower theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 391000, 391000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-69-S', 'prod-001', 'UQ-489399-69-S', 'S', '69 NAVY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-69-M', 'prod-001', 'UQ-489399-69-M', 'M', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-69-L', 'prod-001', 'UQ-489399-69-L', 'L', '69 NAVY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-69-XL', 'prod-001', 'UQ-489399-69-XL', 'XL', '69 NAVY', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-01-S', 'prod-001', 'UQ-489399-01-S', 'S', '01 OFF WHITE', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-01-M', 'prod-001', 'UQ-489399-01-M', 'M', '01 OFF WHITE', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-01-L', 'prod-001', 'UQ-489399-01-L', 'L', '01 OFF WHITE', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489399-01-XL', 'prod-001', 'UQ-489399-01-XL', 'XL', '01 OFF WHITE', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-825412', 'Bộ Sưu Tập Áo Khoác Casual', 'bo-suu-tap-ao-khoac-casual-825412', 'Bộ Sưu Tập Áo Khoác Casual theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 611250, 611250, 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg', '["https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg", "https://im.uniqlo.com/global-cms/spa/res9b5e278f97b517d36e3f1b5ed7e37d6efr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-825412-09-S', 'uq-825412', 'UQ-825412-09-S', 'S', '09 BLACK', 37, 0, 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-825412-09-M', 'uq-825412', 'UQ-825412-09-M', 'M', '09 BLACK', 36, 0, 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-825412-09-L', 'uq-825412', 'UQ-825412-09-L', 'L', '09 BLACK', 53, 0, 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-825412-09-XL', 'uq-825412', 'UQ-825412-09-XL', 'XL', '09 BLACK', 30, 0, 'https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-485671', 'Áo Parka Chống Tia UV Bỏ Túi | NANO Design', 'ao-parka-chong-tia-uv-bo-tui-nano-design-485671', 'Áo Parka Chống Tia UV Bỏ Túi | NANO Design tích hợp công nghệ chống nắng UPF 50+ ngăn chặn 90% tia UV độc hại, bề mặt phủ Nano trượt nước bền bỉ. Tiện lợi bỏ túi nhỏ gọn mang theo hàng ngày.', 'cat-jackets', 980000, 980000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-485671-19-S', 'uq-485671', 'UQ-485671-19-S', 'S', '19 BURGUNDY', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-485671-19-M', 'uq-485671', 'UQ-485671-19-M', 'M', '19 BURGUNDY', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-485671-19-L', 'uq-485671', 'UQ-485671-19-L', 'L', '19 BURGUNDY', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-485671-19-XL', 'uq-485671', 'UQ-485671-19-XL', 'XL', '19 BURGUNDY', 51, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488785', 'Áo Khoác Kéo Khóa Dáng Ngắn', 'ao-khoac-keo-khoa-dang-ngan-488785', 'Áo Khoác Kéo Khóa Dáng Ngắn theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/sub/vngoods_488785_sub6_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488785-34-S', 'uq-488785', 'UQ-488785-34-S', 'S', '34 BROWN', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488785-34-M', 'uq-488785', 'UQ-488785-34-M', 'M', '34 BROWN', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488785-34-L', 'uq-488785', 'UQ-488785-34-L', 'L', '34 BROWN', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488785-34-XL', 'uq-488785', 'UQ-488785-34-XL', 'XL', '34 BROWN', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-469871', 'PUFFTECH Áo Khoác Chần Bông | Có Mũ', 'pufftech-ao-khoac-chan-bong-co-mu-469871', 'PUFFTECH Áo Khoác Chần Bông | Có Mũ ứng dụng công nghệ sợi bông rỗng PUFFTECH độc quyền, giữ nhiệt tương đương lông vũ tự nhiên nhưng nhẹ hơn và kháng ẩm tuyệt đối. Dễ dàng gấp gọn mang theo mọi hành trình.', 'cat-jackets', 2085000, 2085000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-469871-06-S', 'uq-469871', 'UQ-469871-06-S', 'S', '06 GRAY', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-469871-06-M', 'uq-469871', 'UQ-469871-06-M', 'M', '06 GRAY', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-469871-06-L', 'uq-469871', 'UQ-469871-06-L', 'L', '06 GRAY', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-469871-06-XL', 'uq-469871', 'UQ-469871-06-XL', 'XL', '06 GRAY', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-465203', 'DRY-EX Áo Hoodie Chống Tia UV Kéo Khóa', 'dry-ex-ao-hoodie-chong-tia-uv-keo-khoa-465203', 'DRY-EX Áo Hoodie Chống Tia UV Kéo Khóa tích hợp công nghệ chống nắng UPF 50+ ngăn chặn 90% tia UV độc hại, bề mặt phủ Nano trượt nước bền bỉ. Tiện lợi bỏ túi nhỏ gọn mang theo hàng ngày.', 'cat-jackets', 588000, 588000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-18-S', 'uq-465203', 'UQ-465203-18-S', 'S', '18 WINE', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-18-M', 'uq-465203', 'UQ-465203-18-M', 'M', '18 WINE', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-18-L', 'uq-465203', 'UQ-465203-18-L', 'L', '18 WINE', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-18-XL', 'uq-465203', 'UQ-465203-18-XL', 'XL', '18 WINE', 46, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-57-S', 'uq-465203', 'UQ-465203-57-S', 'S', '57 OLIVE', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-57-M', 'uq-465203', 'UQ-465203-57-M', 'M', '57 OLIVE', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-57-L', 'uq-465203', 'UQ-465203-57-L', 'L', '57 OLIVE', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-465203-57-XL', 'uq-465203', 'UQ-465203-57-XL', 'XL', '57 OLIVE', 46, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487324', 'Áo Khoác Hai Mặt', 'ao-khoac-hai-mat-487324', 'Áo Khoác Hai Mặt theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487324-09-S', 'uq-487324', 'UQ-487324-09-S', 'S', '09 BLACK', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487324-09-M', 'uq-487324', 'UQ-487324-09-M', 'M', '09 BLACK', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487324-09-L', 'uq-487324', 'UQ-487324-09-L', 'L', '09 BLACK', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487324-09-XL', 'uq-487324', 'UQ-487324-09-XL', 'XL', '09 BLACK', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-470118', 'PUFFTECH Áo Khoác Chần Bông | Có Mũ', 'pufftech-ao-khoac-chan-bong-co-mu-470118', 'PUFFTECH Áo Khoác Chần Bông | Có Mũ ứng dụng công nghệ sợi bông rỗng PUFFTECH độc quyền, giữ nhiệt tương đương lông vũ tự nhiên nhưng nhẹ hơn và kháng ẩm tuyệt đối. Dễ dàng gấp gọn mang theo mọi hành trình.', 'cat-jackets', 2085000, 2085000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-69-S', 'uq-470118', 'UQ-470118-69-S', 'S', '69 NAVY', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-69-M', 'uq-470118', 'UQ-470118-69-M', 'M', '69 NAVY', 37, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-69-L', 'uq-470118', 'UQ-470118-69-L', 'L', '69 NAVY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-69-XL', 'uq-470118', 'UQ-470118-69-XL', 'XL', '69 NAVY', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-59-S', 'uq-470118', 'UQ-470118-59-S', 'S', '59 DARK GREEN', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-59-M', 'uq-470118', 'UQ-470118-59-M', 'M', '59 DARK GREEN', 37, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-59-L', 'uq-470118', 'UQ-470118-59-L', 'L', '59 DARK GREEN', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-470118-59-XL', 'uq-470118', 'UQ-470118-59-XL', 'XL', '59 DARK GREEN', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-486816', 'Áo Khoác Đa Năng', 'ao-khoac-da-nang-486816', 'Áo Khoác Đa Năng theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 1471000, 1471000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486816-09-S', 'uq-486816', 'UQ-486816-09-S', 'S', '09 BLACK', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486816-09-M', 'uq-486816', 'UQ-486816-09-M', 'M', '09 BLACK', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486816-09-L', 'uq-486816', 'UQ-486816-09-L', 'L', '09 BLACK', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486816-09-XL', 'uq-486816', 'UQ-486816-09-XL', 'XL', '09 BLACK', 48, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-484610', 'Áo Khoác Harrington', 'ao-khoac-harrington-484610', 'Áo Khoác Harrington theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-jackets', 1593750, 1593750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484610-38-S', 'uq-484610', 'UQ-484610-38-S', 'S', '38 DARK BROWN', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484610-38-M', 'uq-484610', 'UQ-484610-38-M', 'M', '38 DARK BROWN', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484610-38-L', 'uq-484610', 'UQ-484610-38-L', 'L', '38 DARK BROWN', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484610-38-XL', 'uq-484610', 'UQ-484610-38-XL', 'XL', '38 DARK BROWN', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487594', 'Áo Khoác Phối Lót Lông Giả Lông Cừu', 'ao-khoac-phoi-lot-long-gia-long-cuu-487594', 'Áo Khoác Phối Lót Lông Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-01-S', 'uq-487594', 'UQ-487594-01-S', 'S', '01 OFF WHITE', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-01-M', 'uq-487594', 'UQ-487594-01-M', 'M', '01 OFF WHITE', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-01-L', 'uq-487594', 'UQ-487594-01-L', 'L', '01 OFF WHITE', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-01-XL', 'uq-487594', 'UQ-487594-01-XL', 'XL', '01 OFF WHITE', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-69-S', 'uq-487594', 'UQ-487594-69-S', 'S', '69 NAVY', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-69-M', 'uq-487594', 'UQ-487594-69-M', 'M', '69 NAVY', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-69-L', 'uq-487594', 'UQ-487594-69-L', 'L', '69 NAVY', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487594-69-XL', 'uq-487594', 'UQ-487594-69-XL', 'XL', '69 NAVY', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-912812', 'Bộ Sưu Tập Áo Giả Lông Cừu', 'bo-suu-tap-ao-gia-long-cuu-912812', 'Bộ Sưu Tập Áo Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 611250, 611250, 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg', '["https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg", "https://im.uniqlo.com/global-cms/spa/res6b140d24af8cf15fc70327f69873b9e5fr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-912812-09-S', 'uq-912812', 'UQ-912812-09-S', 'S', '09 BLACK', 54, 0, 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-912812-09-M', 'uq-912812', 'UQ-912812-09-M', 'M', '09 BLACK', 53, 0, 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-912812-09-L', 'uq-912812', 'UQ-912812-09-L', 'L', '09 BLACK', 35, 0, 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-912812-09-XL', 'uq-912812', 'UQ-912812-09-XL', 'XL', '09 BLACK', 47, 0, 'https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-486116', 'Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa', 'ao-khoac-gia-long-cuu-can-gio-keo-khoa-486116', 'Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486116-69-S', 'uq-486116', 'UQ-486116-69-S', 'S', '69 NAVY', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486116-69-M', 'uq-486116', 'UQ-486116-69-M', 'M', '69 NAVY', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486116-69-L', 'uq-486116', 'UQ-486116-69-L', 'L', '69 NAVY', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486116-69-XL', 'uq-486116', 'UQ-486116-69-XL', 'XL', '69 NAVY', 42, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-489487', 'Áo Khoác Blouson Giả Lông Cừu Kéo Khóa', 'ao-khoac-blouson-gia-long-cuu-keo-khoa-489487', 'Áo Khoác Blouson Giả Lông Cừu Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489487-16-S', 'uq-489487', 'UQ-489487-16-S', 'S', '16 COLOR', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489487-16-M', 'uq-489487', 'UQ-489487-16-M', 'M', '16 COLOR', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489487-16-L', 'uq-489487', 'UQ-489487-16-L', 'L', '16 COLOR', 46, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489487-16-XL', 'uq-489487', 'UQ-489487-16-XL', 'XL', '16 COLOR', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488747', 'Áo Khoác Blouson Giả Lông Cừu Kéo Khóa', 'ao-khoac-blouson-gia-long-cuu-keo-khoa-488747', 'Áo Khoác Blouson Giả Lông Cừu Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488747-32-S', 'uq-488747', 'UQ-488747-32-S', 'S', '32 BEIGE', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488747-32-M', 'uq-488747', 'UQ-488747-32-M', 'M', '32 BEIGE', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488747-32-L', 'uq-488747', 'UQ-488747-32-L', 'L', '32 BEIGE', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488747-32-XL', 'uq-488747', 'UQ-488747-32-XL', 'XL', '32 BEIGE', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488774', 'Áo Khoác Cản Gió Giả Lông Cừu', 'ao-khoac-can-gio-gia-long-cuu-488774', 'Áo Khoác Cản Gió Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.', 'cat-fleece', 1593750, 1593750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488774-09-S', 'uq-488774', 'UQ-488774-09-S', 'S', '09 BLACK', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488774-09-M', 'uq-488774', 'UQ-488774-09-M', 'M', '09 BLACK', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488774-09-L', 'uq-488774', 'UQ-488774-09-L', 'L', '09 BLACK', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488774-09-XL', 'uq-488774', 'UQ-488774-09-XL', 'XL', '09 BLACK', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-252255', 'Bộ Sưu Tập Quần Jeans', 'bo-suu-tap-quan-jeans-252255', 'Bộ Sưu Tập Quần Jeans được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 611250, 611250, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg', '["https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg", "https://im.uniqlo.com/global-cms/spa/res2584c30164f316c72c73e7cde2bc23d5fr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-252255-09-28', 'uq-252255', 'UQ-252255-09-28', '28', '09 BLACK', 36, 0, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-252255-09-29', 'uq-252255', 'UQ-252255-09-29', '29', '09 BLACK', 36, 0, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-252255-09-30', 'uq-252255', 'UQ-252255-09-30', '30', '09 BLACK', 44, 0, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-252255-09-31', 'uq-252255', 'UQ-252255-09-31', '31', '09 BLACK', 41, 0, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-252255-09-32', 'uq-252255', 'UQ-252255-09-32', '32', '09 BLACK', 38, 0, 'https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-477335', 'Quần Jeans Ống Suông', 'quan-jeans-ong-suong-477335', 'Quần Jeans Ống Suông được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477335-65-28', 'uq-477335', 'UQ-477335-65-28', '28', '65 BLUE LIGHT', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477335-65-29', 'uq-477335', 'UQ-477335-65-29', '29', '65 BLUE LIGHT', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477335-65-30', 'uq-477335', 'UQ-477335-65-30', '30', '65 BLUE LIGHT', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477335-65-31', 'uq-477335', 'UQ-477335-65-31', '31', '65 BLUE LIGHT', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477335-65-32', 'uq-477335', 'UQ-477335-65-32', '32', '65 BLUE LIGHT', 31, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-482281', 'Quần Jeans EZY Dáng Rộng Ống Suông', 'quan-jeans-ezy-dang-rong-ong-suong-482281', 'Quần Jeans EZY Dáng Rộng Ống Suông được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-482281-07-28', 'uq-482281', 'UQ-482281-07-28', '28', '07 GRAY BEIGE', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-482281-07-29', 'uq-482281', 'UQ-482281-07-29', '29', '07 GRAY BEIGE', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-482281-07-30', 'uq-482281', 'UQ-482281-07-30', '30', '07 GRAY BEIGE', 52, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-482281-07-31', 'uq-482281', 'UQ-482281-07-31', '31', '07 GRAY BEIGE', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-482281-07-32', 'uq-482281', 'UQ-482281-07-32', '32', '07 GRAY BEIGE', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-480740', 'Quần Jeans Baggy Ống Cong Barrel', 'quan-jeans-baggy-ong-cong-barrel-480740', 'Quần Jeans Baggy Ống Cong Barrel được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-67-28', 'uq-480740', 'UQ-480740-67-28', '28', '67 BLUE', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-67-29', 'uq-480740', 'UQ-480740-67-29', '29', '67 BLUE', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-67-30', 'uq-480740', 'UQ-480740-67-30', '30', '67 BLUE', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-67-31', 'uq-480740', 'UQ-480740-67-31', '31', '67 BLUE', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-67-32', 'uq-480740', 'UQ-480740-67-32', '32', '67 BLUE', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-68-28', 'uq-480740', 'UQ-480740-68-28', '28', '68 BLUE DARK', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-68-29', 'uq-480740', 'UQ-480740-68-29', '29', '68 BLUE DARK', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-480740-68-30', 'uq-480740', 'UQ-480740-68-30', '30', '68 BLUE DARK', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-484808', 'Quần Jeans Baggy Ống Cong Barrel', 'quan-jeans-baggy-ong-cong-barrel-484808', 'Quần Jeans Baggy Ống Cong Barrel được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484808-64-28', 'uq-484808', 'UQ-484808-64-28', '28', '64 COLOR', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484808-64-29', 'uq-484808', 'UQ-484808-64-29', '29', '64 COLOR', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484808-64-30', 'uq-484808', 'UQ-484808-64-30', '30', '64 COLOR', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484808-64-31', 'uq-484808', 'UQ-484808-64-31', '31', '64 COLOR', 46, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484808-64-32', 'uq-484808', 'UQ-484808-64-32', '32', '64 COLOR', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487207', 'Quần Jeans Ống Barrel | Nhung Gân', 'quan-jeans-ong-barrel-nhung-gan-487207', 'Quần Jeans Ống Barrel | Nhung Gân được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-09-28', 'uq-487207', 'UQ-487207-09-28', '28', '09 BLACK', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-09-29', 'uq-487207', 'UQ-487207-09-29', '29', '09 BLACK', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-09-30', 'uq-487207', 'UQ-487207-09-30', '30', '09 BLACK', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-09-31', 'uq-487207', 'UQ-487207-09-31', '31', '09 BLACK', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-09-32', 'uq-487207', 'UQ-487207-09-32', '32', '09 BLACK', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-34-28', 'uq-487207', 'UQ-487207-34-28', '28', '34 BROWN', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-34-29', 'uq-487207', 'UQ-487207-34-29', '29', '34 BROWN', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487207-34-30', 'uq-487207', 'UQ-487207-34-30', '30', '34 BROWN', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488630', 'Quần Jeans EZY Ống Cong Barrel​', 'quan-jeans-ezy-ong-cong-barrel-488630', 'Quần Jeans EZY Ống Cong Barrel​ được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488630-66-28', 'uq-488630', 'UQ-488630-66-28', '28', '66 COLOR', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488630-66-29', 'uq-488630', 'UQ-488630-66-29', '29', '66 COLOR', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488630-66-30', 'uq-488630', 'UQ-488630-66-30', '30', '66 COLOR', 37, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488630-66-31', 'uq-488630', 'UQ-488630-66-31', '31', '66 COLOR', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488630-66-32', 'uq-488630', 'UQ-488630-66-32', '32', '66 COLOR', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488743', 'Quần Jeans Ống Cong Barrel​', 'quan-jeans-ong-cong-barrel-488743', 'Quần Jeans Ống Cong Barrel​ được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.', 'cat-jeans', 1225000, 1225000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488743-69-28', 'uq-488743', 'UQ-488743-69-28', '28', '69 NAVY', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488743-69-29', 'uq-488743', 'UQ-488743-69-29', '29', '69 NAVY', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488743-69-30', 'uq-488743', 'UQ-488743-69-30', '30', '69 NAVY', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488743-69-31', 'uq-488743', 'UQ-488743-69-31', '31', '69 NAVY', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488743-69-32', 'uq-488743', 'UQ-488743-69-32', '32', '69 NAVY', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-486317', 'Quần Easy Ống Rộng Vải Gân', 'quan-easy-ong-rong-vai-gan-486317', 'Quần Easy Ống Rộng Vải Gân sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 588000, 588000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-03-28', 'uq-486317', 'UQ-486317-03-28', '28', '03 GRAY', 51, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-03-29', 'uq-486317', 'UQ-486317-03-29', '29', '03 GRAY', 48, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-03-30', 'uq-486317', 'UQ-486317-03-30', '30', '03 GRAY', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-03-31', 'uq-486317', 'UQ-486317-03-31', '31', '03 GRAY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-03-32', 'uq-486317', 'UQ-486317-03-32', '32', '03 GRAY', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-09-28', 'uq-486317', 'UQ-486317-09-28', '28', '09 BLACK', 51, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-09-29', 'uq-486317', 'UQ-486317-09-29', '29', '09 BLACK', 48, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-486317-09-30', 'uq-486317', 'UQ-486317-09-30', '30', '09 BLACK', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-2825', 'Áo Thun Vải Gân Có Mũ', 'ao-thun-vai-gan-co-mu-2825', 'Áo Thun Vải Gân Có Mũ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 488750, 488750, 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg', '["https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg", "https://im.uniqlo.com/global-cms/spa/resdabe40c52737561c55df4dad73f278e5fr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-2825-09-S', 'uq-2825', 'UQ-2825-09-S', 'S', '09 BLACK', 46, 0, 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-2825-09-M', 'uq-2825', 'UQ-2825-09-M', 'M', '09 BLACK', 49, 0, 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-2825-09-L', 'uq-2825', 'UQ-2825-09-L', 'L', '09 BLACK', 47, 0, 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-2825-09-XL', 'uq-2825', 'UQ-2825-09-XL', 'XL', '09 BLACK', 30, 0, 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-233741', 'Quần Easy Ống Rộng Vải Gân', 'quan-easy-ong-rong-vai-gan-233741', 'Quần Easy Ống Rộng Vải Gân sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 588000, 588000, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg', '["https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg", "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-233741-09-28', 'uq-233741', 'UQ-233741-09-28', '28', '09 BLACK', 36, 0, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-233741-09-29', 'uq-233741', 'UQ-233741-09-29', '29', '09 BLACK', 30, 0, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-233741-09-30', 'uq-233741', 'UQ-233741-09-30', '30', '09 BLACK', 41, 0, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-233741-09-31', 'uq-233741', 'UQ-233741-09-31', '31', '09 BLACK', 46, 0, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-233741-09-32', 'uq-233741', 'UQ-233741-09-32', '32', '09 BLACK', 48, 0, 'https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487837', 'Quần Culottes Vải Denim Dáng Rũ', 'quan-culottes-vai-denim-dang-ru-487837', 'Quần Culottes Vải Denim Dáng Rũ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 784000, 784000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487837-69-28', 'uq-487837', 'UQ-487837-69-28', '28', '69 NAVY', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487837-69-29', 'uq-487837', 'UQ-487837-69-29', '29', '69 NAVY', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487837-69-30', 'uq-487837', 'UQ-487837-69-30', '30', '69 NAVY', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487837-69-31', 'uq-487837', 'UQ-487837-69-31', '31', '69 NAVY', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487837-69-32', 'uq-487837', 'UQ-487837-69-32', '32', '69 NAVY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487214', 'Quần Chino Dáng Barrel', 'quan-chino-dang-barrel-487214', 'Quần Chino Dáng Barrel sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 784000, 784000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-07-28', 'uq-487214', 'UQ-487214-07-28', '28', '07 GRAY BEIGE', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-07-29', 'uq-487214', 'UQ-487214-07-29', '29', '07 GRAY BEIGE', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-07-30', 'uq-487214', 'UQ-487214-07-30', '30', '07 GRAY BEIGE', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-07-31', 'uq-487214', 'UQ-487214-07-31', '31', '07 GRAY BEIGE', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-07-32', 'uq-487214', 'UQ-487214-07-32', '32', '07 GRAY BEIGE', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-09-28', 'uq-487214', 'UQ-487214-09-28', '28', '09 BLACK', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-09-29', 'uq-487214', 'UQ-487214-09-29', '29', '09 BLACK', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487214-09-30', 'uq-487214', 'UQ-487214-09-30', '30', '09 BLACK', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-484875', 'Quần Dài Ống Cong Barrel', 'quan-dai-ong-cong-barrel-484875', 'Quần Dài Ống Cong Barrel sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 980000, 980000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-32-28', 'uq-484875', 'UQ-484875-32-28', '28', '32 BEIGE', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-32-29', 'uq-484875', 'UQ-484875-32-29', '29', '32 BEIGE', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-32-30', 'uq-484875', 'UQ-484875-32-30', '30', '32 BEIGE', 42, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-32-31', 'uq-484875', 'UQ-484875-32-31', '31', '32 BEIGE', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-32-32', 'uq-484875', 'UQ-484875-32-32', '32', '32 BEIGE', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-34-28', 'uq-484875', 'UQ-484875-34-28', '28', '34 BROWN', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-34-29', 'uq-484875', 'UQ-484875-34-29', '29', '34 BROWN', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-484875-34-30', 'uq-484875', 'UQ-484875-34-30', '30', '34 BROWN', 42, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488739', 'Quần Easy Co Giãn | Vải Jersey', 'quan-easy-co-gian-vai-jersey-488739', 'Quần Easy Co Giãn | Vải Jersey sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 588000, 588000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-69-28', 'uq-488739', 'UQ-488739-69-28', '28', '69 NAVY', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-69-29', 'uq-488739', 'UQ-488739-69-29', '29', '69 NAVY', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-69-30', 'uq-488739', 'UQ-488739-69-30', '30', '69 NAVY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-69-31', 'uq-488739', 'UQ-488739-69-31', '31', '69 NAVY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-69-32', 'uq-488739', 'UQ-488739-69-32', '32', '69 NAVY', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-32-28', 'uq-488739', 'UQ-488739-32-28', '28', '32 BEIGE', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-32-29', 'uq-488739', 'UQ-488739-32-29', '29', '32 BEIGE', 54, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488739-32-30', 'uq-488739', 'UQ-488739-32-30', '30', '32 BEIGE', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-475344', 'Quần Dài Ống Cong Barrel Vải Jersey​', 'quan-dai-ong-cong-barrel-vai-jersey-475344', 'Quần Dài Ống Cong Barrel Vải Jersey​ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.', 'cat-pants', 980000, 980000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/sub/vngoods_475344_sub6_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-58-28', 'uq-475344', 'UQ-475344-58-28', '28', '58 DARK GREEN', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-58-29', 'uq-475344', 'UQ-475344-58-29', '29', '58 DARK GREEN', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-58-30', 'uq-475344', 'UQ-475344-58-30', '30', '58 DARK GREEN', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-58-31', 'uq-475344', 'UQ-475344-58-31', '31', '58 DARK GREEN', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-58-32', 'uq-475344', 'UQ-475344-58-32', '32', '58 DARK GREEN', 49, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-39-28', 'uq-475344', 'UQ-475344-39-28', '28', '39 DARK BROWN', 39, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-39-29', 'uq-475344', 'UQ-475344-39-29', '29', '39 DARK BROWN', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-475344-39-30', 'uq-475344', 'UQ-475344-39-30', '30', '39 DARK BROWN', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-121425', 'Áo Ba Lỗ và Áo Hai Dây', 'ao-ba-lo-va-ao-hai-day-121425', 'Áo Ba Lỗ và Áo Hai Dây trang bị sợi vi mảnh AIRism siêu mịn màng, làm mát tức thì và kháng khuẩn ngăn mùi. Thiết kế nhẹ như làn da thứ hai, thấm hút mồ hôi nhanh chóng.', 'cat-tshirts', 195000, 195000, 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg', '["https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg", "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-121425-09-S', 'uq-121425', 'UQ-121425-09-S', 'S', '09 BLACK', 39, 0, 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-121425-09-M', 'uq-121425', 'UQ-121425-09-M', 'M', '09 BLACK', 36, 0, 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-121425-09-L', 'uq-121425', 'UQ-121425-09-L', 'L', '09 BLACK', 34, 0, 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-121425-09-XL', 'uq-121425', 'UQ-121425-09-XL', 'XL', '09 BLACK', 37, 0, 'https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487120', 'Áo Ba Lỗ Cổ Henley', 'ao-ba-lo-co-henley-487120', 'Áo Ba Lỗ Cổ Henley trang bị sợi vi mảnh AIRism siêu mịn màng, làm mát tức thì và kháng khuẩn ngăn mùi. Thiết kế nhẹ như làn da thứ hai, thấm hút mồ hôi nhanh chóng.', 'cat-tshirts', 195000, 195000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-09-S', 'uq-487120', 'UQ-487120-09-S', 'S', '09 BLACK', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-09-M', 'uq-487120', 'UQ-487120-09-M', 'M', '09 BLACK', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-09-L', 'uq-487120', 'UQ-487120-09-L', 'L', '09 BLACK', 31, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-09-XL', 'uq-487120', 'UQ-487120-09-XL', 'XL', '09 BLACK', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-00-S', 'uq-487120', 'UQ-487120-00-S', 'S', '00 WHITE', 45, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-00-M', 'uq-487120', 'UQ-487120-00-M', 'M', '00 WHITE', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-00-L', 'uq-487120', 'UQ-487120-00-L', 'L', '00 WHITE', 31, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487120-00-XL', 'uq-487120', 'UQ-487120-00-XL', 'XL', '00 WHITE', 53, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487908', 'Áo Thun Vải Gân Cổ Henley', 'ao-thun-vai-gan-co-henley-487908', 'Áo Thun Vải Gân Cổ Henley theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 488750, 488750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-69-S', 'uq-487908', 'UQ-487908-69-S', 'S', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-69-M', 'uq-487908', 'UQ-487908-69-M', 'M', '69 NAVY', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-69-L', 'uq-487908', 'UQ-487908-69-L', 'L', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-69-XL', 'uq-487908', 'UQ-487908-69-XL', 'XL', '69 NAVY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-79-S', 'uq-487908', 'UQ-487908-79-S', 'S', '79 PURPLE DARK', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-79-M', 'uq-487908', 'UQ-487908-79-M', 'M', '79 PURPLE DARK', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-79-L', 'uq-487908', 'UQ-487908-79-L', 'L', '79 PURPLE DARK', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487908-79-XL', 'uq-487908', 'UQ-487908-79-XL', 'XL', '79 PURPLE DARK', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-488298', 'Áo Thun Vải Gân Có Mũ', 'ao-thun-vai-gan-co-mu-488298', 'Áo Thun Vải Gân Có Mũ theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 488750, 488750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-69-S', 'uq-488298', 'UQ-488298-69-S', 'S', '69 NAVY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-69-M', 'uq-488298', 'UQ-488298-69-M', 'M', '69 NAVY', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-69-L', 'uq-488298', 'UQ-488298-69-L', 'L', '69 NAVY', 42, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-69-XL', 'uq-488298', 'UQ-488298-69-XL', 'XL', '69 NAVY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-03-S', 'uq-488298', 'UQ-488298-03-S', 'S', '03 GRAY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-03-M', 'uq-488298', 'UQ-488298-03-M', 'M', '03 GRAY', 35, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-03-L', 'uq-488298', 'UQ-488298-03-L', 'L', '03 GRAY', 42, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-488298-03-XL', 'uq-488298', 'UQ-488298-03-XL', 'XL', '03 GRAY', 50, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-489372', 'Áo Thun Mini | Raglan', 'ao-thun-mini-raglan-489372', 'Áo Thun Mini | Raglan theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 488750, 488750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-37-S', 'uq-489372', 'UQ-489372-37-S', 'S', '37 BROWN', 37, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-37-M', 'uq-489372', 'UQ-489372-37-M', 'M', '37 BROWN', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-37-L', 'uq-489372', 'UQ-489372-37-L', 'L', '37 BROWN', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-37-XL', 'uq-489372', 'UQ-489372-37-XL', 'XL', '37 BROWN', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-69-S', 'uq-489372', 'UQ-489372-69-S', 'S', '69 NAVY', 37, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-69-M', 'uq-489372', 'UQ-489372-69-M', 'M', '69 NAVY', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-69-L', 'uq-489372', 'UQ-489372-69-L', 'L', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489372-69-XL', 'uq-489372', 'UQ-489372-69-XL', 'XL', '69 NAVY', 41, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-489061', 'Áo Polo | Kẻ Sọc', 'ao-polo-ke-soc-489061', 'Áo Polo | Kẻ Sọc theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 735000, 735000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-69-S', 'uq-489061', 'UQ-489061-69-S', 'S', '69 NAVY', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-69-M', 'uq-489061', 'UQ-489061-69-M', 'M', '69 NAVY', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-69-L', 'uq-489061', 'UQ-489061-69-L', 'L', '69 NAVY', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-69-XL', 'uq-489061', 'UQ-489061-69-XL', 'XL', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-38-S', 'uq-489061', 'UQ-489061-38-S', 'S', '38 DARK BROWN', 40, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-38-M', 'uq-489061', 'UQ-489061-38-M', 'M', '38 DARK BROWN', 30, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-38-L', 'uq-489061', 'UQ-489061-38-L', 'L', '38 DARK BROWN', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-489061-38-XL', 'uq-489061', 'UQ-489061-38-XL', 'XL', '38 DARK BROWN', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-487328', 'Áo Choàng Balmacaan', 'ao-choang-balmacaan-487328', 'Áo Choàng Balmacaan theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 3680000, 3680000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487328-07-S', 'uq-487328', 'UQ-487328-07-S', 'S', '07 GRAY BEIGE', 34, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487328-07-M', 'uq-487328', 'UQ-487328-07-M', 'M', '07 GRAY BEIGE', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487328-07-L', 'uq-487328', 'UQ-487328-07-L', 'L', '07 GRAY BEIGE', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-487328-07-XL', 'uq-487328', 'UQ-487328-07-XL', 'XL', '07 GRAY BEIGE', 47, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-477704', 'AirSense Áo Blazer', 'airsense-ao-blazer-477704', 'AirSense Áo Blazer theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-tshirts', 1838750, 1838750, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477704-69-S', 'uq-477704', 'UQ-477704-69-S', 'S', '69 NAVY', 44, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477704-69-M', 'uq-477704', 'UQ-477704-69-M', 'M', '69 NAVY', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477704-69-L', 'uq-477704', 'UQ-477704-69-L', 'L', '69 NAVY', 32, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-477704-69-XL', 'uq-477704', 'UQ-477704-69-XL', 'XL', '69 NAVY', 38, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-491199', 'Bộ Pyjama Vải Satin', 'bo-pyjama-vai-satin-491199', 'Bộ Pyjama Vải Satin theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-loungewear', 588000, 588000, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750', '["https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750", "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-10-S', 'uq-491199', 'UQ-491199-10-S', 'S', '10 PINK', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-10-M', 'uq-491199', 'UQ-491199-10-M', 'M', '10 PINK', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-10-L', 'uq-491199', 'UQ-491199-10-L', 'L', '10 PINK', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-10-XL', 'uq-491199', 'UQ-491199-10-XL', 'XL', '10 PINK', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-69-S', 'uq-491199', 'UQ-491199-69-S', 'S', '69 NAVY', 43, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-69-M', 'uq-491199', 'UQ-491199-69-M', 'M', '69 NAVY', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-69-L', 'uq-491199', 'UQ-491199-69-L', 'L', '69 NAVY', 36, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-491199-69-XL', 'uq-491199', 'UQ-491199-69-XL', 'XL', '69 NAVY', 33, 0, 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, description, category_id, base_price, original_price, thumbnail_url, images, is_active, is_featured, created_at, updated_at)
VALUES ('uq-294585', 'Chân Váy Xếp Ly Vải Nylon', 'chan-vay-xep-ly-vai-nylon-294585', 'Chân Váy Xếp Ly Vải Nylon theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.', 'cat-dresses', 784000, 784000, 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg', '["https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg", "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"]'::jsonb, true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, thumbnail_url = EXCLUDED.thumbnail_url, images = EXCLUDED.images;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-294585-09-S', 'uq-294585', 'UQ-294585-09-S', 'S', '09 BLACK', 38, 0, 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-294585-09-M', 'uq-294585', 'UQ-294585-09-M', 'M', '09 BLACK', 43, 0, 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-294585-09-L', 'uq-294585', 'UQ-294585-09-L', 'L', '09 BLACK', 40, 0, 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock_quantity, price_modifier, garment_image_url)
VALUES ('v-294585-09-XL', 'uq-294585', 'UQ-294585-09-XL', 'XL', '09 BLACK', 42, 0, 'https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg')
ON CONFLICT (id) DO NOTHING;
