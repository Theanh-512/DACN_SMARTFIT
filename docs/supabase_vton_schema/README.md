# Supabase schema — Fashion e-commerce + AI Virtual Try-On

## Included files
- `20261016000100_ecommerce_vton.sql`: consolidated PostgreSQL migration for a fresh Supabase project.
- `ERD.mmd`: Mermaid ERD source.

## Architecture
- Supabase Auth owns credentials. `public.profiles` contains profile data only; it has no password/hash field.
- PostgreSQL owns catalogue, cart, addresses, orders, payment records, inventory reservations and try-on job metadata.
- FastAPI runs IDM-VTON, validates images, updates job outcomes, verifies VNPay/MoMo callbacks and writes generated images.
- Supabase Storage buckets: `product-images` (public catalogue images), `try-on-inputs` (private user uploads), `try-on-results` (private generated results).
- The frontend must never contain a Supabase secret/service-role key. Server-side secrets belong in FastAPI environment secrets only.

## Migration order
1. Create a Supabase project and ensure Auth + Storage are enabled.
2. Back up/export any existing project before applying this migration. This script targets a fresh project and should not be blindly run against an existing production schema.
3. Run the SQL file in the Supabase SQL Editor as a database administrator, or turn it into a Supabase CLI migration and apply it to a local/preview project first.
4. Create a test account using Supabase Auth.
5. Add the first admin by executing the commented `INSERT INTO public.user_roles ...` at the bottom of the SQL file, replacing the UUID with the actual Auth user ID. Never grant clients write access to `user_roles`.
6. In admin tooling, insert categories/products/variants and catalogue object paths. New variants start at zero stock; call trusted `adjust_inventory` for stock-in so the ledger is recorded. Admins upload product images to `product-images`; `storage_path` should be the object path, not a signed URL.
7. Configure FastAPI secrets: Supabase URL, server-only secret/service-role key (or a least-privilege database connection), VNPay/MoMo secrets. The secret/service-role key must never be shipped to browser code.
8. Configure a scheduler to call `public.expire_order_reservations(200)` periodically using a trusted server credential. Confirm the project supports the chosen scheduler before relying on it.

## Important RPC contracts

### `create_order(p_items, p_address_id, p_provider, p_idempotency_key)`
Call as an authenticated user. `p_items` is JSON such as:
```json
[
  {"variant_id":"00000000-0000-0000-0000-000000000001", "quantity":2}
]
```
Use a fresh UUID idempotency key per checkout attempt and reuse that same key only for retries of that attempt. The RPC re-reads prices from the database, locks variant rows, checks available stock (`stock_quantity - reserved_quantity`), reserves inventory, snapshots address/product details and creates a payment record in one database transaction. Online reservations expire after 15 minutes. COD orders are confirmed immediately and remain reserved until cancelled or fulfilled.

Shipping fee is read from `public.store_settings` (example default: 30,000 VND). Change it through trusted admin tooling/SQL; clients have no access to this table. Discounts/coupons are deliberately not implemented; `discount_amount` remains zero.

### `cancel_order(p_order_id)`
Call as the owner of the order. The customer can cancel `pending_payment` or `confirmed` orders. Cancellation releases reserved stock atomically. It rejects orders already processing/shipped/delivered.

### `expire_order_reservations(p_batch_size)`
Call only from a trusted scheduler/backend. It expires overdue online orders and releases reservations. The RPC is not executable by `anon` or `authenticated`.

### `create_payment_attempt(p_order_id, p_provider, p_idempotency_key)`
Server-only RPC for a fresh VNPay/MoMo attempt or retry while the order is still `pending_payment` and its reservation is live. It returns `provider_order_ref`; use that exact reference when creating the provider checkout request and when matching the callback. Reusing the same idempotency key returns the same attempt. Starting a new attempt closes earlier pending attempts; any late success from a closed attempt is sent to manual review.

### `process_payment_webhook(...)`
Call only from FastAPI after cryptographically verifying the VNPay/MoMo signature, merchant ID, exact `provider_order_ref`, amount, currency and event authenticity. Pass the exact `provider_order_ref` so an old callback cannot accidentally settle a newer retry attempt. This function implements event idempotency and consistency checks but **does not itself validate the provider signature**. Normalize provider-specific amount units before calling it. Late successful payments after expiry/cancellation are marked `manual_review`; handle refund/reconciliation operationally.

### `adjust_inventory(p_product_variant_id, p_stock_delta, p_reason)`
Server-only RPC for restocking or correcting inventory. It locks the variant, refuses changes that would reduce physical stock below reserved quantities, and writes an `inventory_movements` audit row. Catalog clients cannot directly write `stock_quantity` or `reserved_quantity`.

### `fulfill_order(p_order_id)`
Call from a trusted order-fulfillment backend only after business checks. It changes `confirmed` to `processing` and converts reserved quantities into sold quantities exactly once.

### `record_cod_collection(p_order_id)`
Server-only RPC to mark the COD payment as collected after the order reaches `delivered`. Do not expose it as a direct client RPC.

### `create_try_on_job(p_product_variant_id, p_input_image_path)`
Call as the authenticated user after uploading an image to `try-on-inputs/{auth.uid()}/{random-file}`. The database verifies that the path belongs to the caller and a stored object exists, then selects a configured garment image and creates a queued job. FastAPI processes the job and writes output to `try-on-results/{user_id}/{job_id}/result.webp` (or another permitted image extension) using server-side credentials. The worker must verify job ownership/state before writing updates.

## Security and implementation notes
- RLS is enabled on every app table in `public`. Policies are paired with explicit grants; both are required.
- `user_roles` and `store_settings` have no client policies/privileges. Do not trust `user_metadata` for admin authorization.
- `profiles` does not store password hashes. Auth identity and password management are delegated to Supabase Auth.
- Never trust a price, total, role, order status, payment status, stock count or generated output path supplied by the browser.
- MIME type / Storage `allowed_mime_types` are not file-content validation. FastAPI should decode images, enforce pixel/dimension limits, reject malformed files, rate-limit requests, and apply timeouts/quotas.
- Private Storage objects should be accessed through authenticated Storage requests or short-lived signed URLs generated only after authorization. Do not place private images in the public `product-images` bucket.
- For real VNPay/MoMo integration, follow their current callback/signature documentation and use a persistent webhook event ID; do not mark paid based only on the browser redirect.
- For larger production systems, consider a separate least-privilege worker DB role instead of using the service-role key for every internal operation. Never put that key in frontend bundles or public logs.
- Review cascade/delete and data-retention requirements before production. Auth user deletion is blocked for accounts with order history because `orders.user_id` uses `RESTRICT`; this intentionally protects financial records. Production account deletion should use an explicit anonymization/retention workflow, or a designed pseudonymous customer record, rather than blindly deleting the Auth user.

## Tests before frontend integration
1. Auth/RLS isolation: create users A and B. A cannot read/update B's profile, addresses, cart, wishlist, orders, payments or try-on jobs.
2. Roles: authenticated user cannot read/insert/update/delete `user_roles`, and cannot promote self to admin via profile metadata or API.
3. Catalogue: anon reads only active catalogue records; draft/archived products and inactive variants are not exposed through the table API. Product image objects are public by design, so only catalogue assets belong in that bucket.
4. Checkout price tampering: send altered client-side prices/totals; RPC ignores them because it accepts no price input and calculates amounts from DB values.
5. Concurrency: with stock=1 and reserved=0, submit two concurrent orders for quantity=1. Exactly one should succeed; stock should not go negative and `reserved_quantity <= stock_quantity` must hold.
6. Idempotency: replay the same `create_order` request with the same user/idempotency UUID. It returns the original order rather than creating another reservation/payment.
7. Expiration race: invoke expiration twice and race it against a payment callback. Inventory is released at most once; a late payment is flagged for manual review/refund rather than resurrecting an expired order.
8. Webhook replay: submit the same `(provider, provider_event_id)` repeatedly. Only the first event is processed. Wrong amount/currency or reused transaction ID must not confirm the order.
9. Client write restrictions: direct REST `INSERT/UPDATE/DELETE` to orders, order_items, payments, payment_events, inventory_movements, and try_on job status/output must be denied.
10. Storage: user A cannot list/read/delete user B input/output objects. Authenticated users cannot upload to `try-on-results`. Anonymous users cannot read private buckets.
11. Inventory audit: direct client UPDATE of `stock_quantity`/`reserved_quantity` fails; `adjust_inventory` changes stock only when `stock_quantity + delta >= reserved_quantity` and appends a movement.
12. COD workflow: COD orders remain unpaid until status is delivered, then the trusted backend calls `record_cod_collection`.
13. Review integrity: a user cannot review a product unless the linked order item belongs to them and the order status is delivered; an order item can be reviewed only once.
14. Image abuse: test oversized/decompression-bomb images, wrong file contents with image MIME type, unsupported formats, rate limits, and model timeout behavior in FastAPI.

## Limitations to address before production
- There is no refund automation; late successful payments are flagged for manual refund/reconciliation.
- The SQL provides the core order/reservation/fulfillment RPCs. Shipping label, shipment tracking, returns/refunds and coupon logic need their own controlled backend transitions.
- A recurring worker/scheduler must call `expire_order_reservations`; otherwise expired reservations will remain held until the function runs.
- Category cycles are blocked only for direct self-parenting in this baseline. If editors can create nested categories, add a trigger/RPC to prevent longer parent cycles.
- Test this migration on a new Supabase project/preview branch first. It has not been executed against your specific Supabase instance.
