-- =============================================================================
-- Migration: 20261016000300_ai_contributions.sql
-- Mô tả: Mở rộng cơ sở dữ liệu hỗ trợ Visual Search, Size Recommendation & VTON Traceability
-- =============================================================================

begin;

-- 1. Bảng lưu trữ thông số may đo chuẩn thành phẩm (Size Charts)
create table if not exists public.product_size_charts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  size_label text not null check (size_label in ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
  chest_cm numeric(5, 2),
  waist_cm numeric(5, 2),
  hip_cm numeric(5, 2),
  shoulder_cm numeric(5, 2),
  garment_length_cm numeric(5, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_size_charts_cat on public.product_size_charts(category_id);
create index if not exists idx_size_charts_prod on public.product_size_charts(product_id);

-- 2. Bảng lưu trữ số đo cơ thể người dùng (User Body Measurements)
create table if not exists public.user_body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  height_cm numeric(5, 2) not null check (height_cm >= 100 and height_cm <= 250),
  weight_kg numeric(5, 2) check (weight_kg is null or (weight_kg >= 30 and weight_kg <= 200)),
  chest_cm numeric(5, 2) check (chest_cm is null or (chest_cm >= 50 and chest_cm <= 180)),
  waist_cm numeric(5, 2) check (waist_cm is null or (waist_cm >= 40 and waist_cm <= 160)),
  hip_cm numeric(5, 2) check (hip_cm is null or (hip_cm >= 50 and hip_cm <= 180)),
  shoulder_cm numeric(5, 2),
  fit_preference text not null default 'regular' check (fit_preference in ('slim', 'regular', 'relaxed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_measurement unique (user_id)
);

-- Row Level Security cho user_body_measurements: Chỉ chính người dùng được xem và chỉnh sửa số đo của mình
alter table public.user_body_measurements enable row level security;

create policy "Users can view their own measurements"
  on public.user_body_measurements for select
  using (auth.uid() = user_id);

create policy "Users can insert or update their own measurements"
  on public.user_body_measurements for all
  using (auth.uid() = user_id);

-- 3. Bảng lưu trữ vector đặc trưng hình ảnh sản phẩm (Product Image Embeddings)
create table if not exists public.product_image_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  embedding_dim int not null default 576,
  model_version text not null default 'mobilenet_v3_small_l2',
  -- Lưu trữ vector dưới dạng mảng float để tương thích chuẩn SQL hoặc extension vector
  embedding_vector jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_embeddings_prod on public.product_image_embeddings(product_id);

-- 4. Bổ sung các trường đo lường độ trễ và chẩn đoán kiểm định cho try_on_jobs
alter table public.try_on_jobs
  add column if not exists validation_status text default 'passed' check (validation_status in ('passed', 'rejected', 'skipped')),
  add column if not exists validation_error text,
  add column if not exists validation_time_ms int default 0,
  add column if not exists preprocess_time_ms int default 0,
  add column if not exists inference_time_ms int default 0,
  add column if not exists postprocess_time_ms int default 0,
  add column if not exists total_time_ms int default 0;

-- 5. Bảng lưu trữ hồ sơ nhân vật 3D SMPL-X và số đo ISO 8559 của người dùng
create table if not exists public.user_3d_avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  avatar_name text default 'Nhân vật chính',
  height_cm numeric(5, 2) not null,
  weight_kg numeric(5, 2) not null,
  body_type text not null default 'regular',
  skin_tone text not null default 'asian',
  skin_hex text not null default '#E8C39E',
  betas jsonb not null, -- Mảng 10 số thực đại diện cho tham số hình thái SMPL-X
  iso_measurements jsonb not null, -- Số đo vòng ngực, eo, mông, vai theo ISO 8559
  glb_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_3d_avatars enable row level security;

create policy "Users can view and manage their own 3D avatars"
  on public.user_3d_avatars for all
  using (auth.uid() = user_id);

commit;
