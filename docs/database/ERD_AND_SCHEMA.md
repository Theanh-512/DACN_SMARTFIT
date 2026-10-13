# Database ERD & Schema Design (SQL Server)

Hệ thống cơ sở dữ liệu quan hệ được thiết kế chuẩn hoá 3NF nhằm đảm bảo tính toàn vẹn dữ liệu và giao dịch ACID.

---

## 1. Các Thực Thể Chính (Entities)

### `Products`
- `Id` (Guid, PK)
- `Name` (NVarChar(255))
- `Slug` (VarChar(255), Unique Index)
- `Description` (NVarChar(Max))
- `CategoryId` (Guid, FK)
- `BasePrice` (Decimal(18,2))
- `IsActive` (Bit)
- `CreatedAt` (DateTimeOffset)

### `ProductVariants` (Quản lý tồn kho theo Size & Màu)
- `Id` (Guid, PK)
- `ProductId` (Guid, FK)
- `Sku` (VarChar(100), Unique Index)
- `Size` (VarChar(20))
- `Color` (NVarChar(50))
- `StockQuantity` (Int)
- `PriceModifier` (Decimal(18,2))
- `GarmentImageUrl` (NVarChar(500))

### `TryOnTasks` (Lịch sử thử đồ ảo)
- `Id` (Guid, PK)
- `UserId` (Guid, FK)
- `ProductId` (Guid, FK)
- `VariantId` (Guid, FK)
- `Status` (VarChar(50): Pending, Processing, Success, Failed)
- `UserImageStorageKey` (NVarChar(500))
- `ResultImageStorageKey` (NVarChar(500))
- `InferenceTimeMs` (Int)
- `CreatedAt` (DateTimeOffset)
- `ExpiresAt` (DateTimeOffset - TTL 24h)

### `Orders` & `OrderItems`
- Quản lý trạng thái thanh toán, tổng tiền, chiết khấu và địa chỉ giao hàng.
