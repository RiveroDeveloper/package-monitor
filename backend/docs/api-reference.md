# API reference

Base URL: `http://localhost:3000/api`

All non-public endpoints require `Authorization: Bearer <jwt>`. See [`authentication.md`](./authentication.md) for the role/permission matrix.

Conventions:
- Request and response bodies are JSON unless stated otherwise.
- All IDs are UUID v4 strings (e.g. `f7b7a353-773b-4b57-90fa-bf4f7cddd247`).
- Date/timestamp fields are ISO 8601 strings (`2026-04-26T01:11:09.000Z`).
- The `@Exclude()`-decorated `password` field is **never** in any response.
- Validation errors return `400` with `{ message: string[] }`.

## High-level endpoint map

```mermaid
flowchart LR
    subgraph Auth [/api/auth]
        AL[POST /login]
        AR[POST /register]
        AP[GET /profile<br/>auth]
    end
    subgraph Users [/api/users]
        UL[GET /<br/>Admin]
        UG[GET /:id<br/>auth]
        UP[PATCH /:id<br/>Admin]
        UD[DELETE /:id<br/>Admin]
    end
    subgraph Warehouses [/api/warehouses]
        WL[GET /<br/>auth]
        WG[GET /:id<br/>auth]
        WC[POST /<br/>Admin]
        WP[PATCH /:id<br/>Admin]
        WD[DELETE /:id<br/>Admin]
    end
    subgraph Packages [/api/packages]
        PL[GET /<br/>auth]
        PG[GET /:id<br/>auth]
        PC[POST /<br/>auth]
        PP[PATCH /:id<br/>auth]
        PD[DELETE /:id<br/>auth]
    end
    subgraph PkgLogs [/api/package-logs]
        LL[GET /<br/>auth]
        LBP[GET /by-package/:packageId<br/>auth]
        LG[GET /:id<br/>auth]
        LC[POST /<br/>auth]
        LP[PATCH /:id<br/>auth]
        LD[DELETE /:id<br/>auth]
    end
```

---

## Auth

### POST `/api/auth/register`
Public. Creates a new user with role `User` (always — the field cannot be overridden) and returns a fresh JWT.

**Body**
```json
{
  "name": "Juan Test",
  "email": "juan@test.com",
  "password": "password123"
}
```

**Validation**
- `name`: non-empty string, max 255 chars
- `email`: must be a valid email (lowercased before insertion)
- `password`: string, min 8 chars, max 255 chars

**Response — 201**
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIs..." }
```

**Errors**
- `400` — `email is already in use` / validation failure
- `400` — payload contains an unknown field (e.g. `role`)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Test","email":"juan@test.com","password":"password123"}'
```

### POST `/api/auth/login`
Public. Issues a JWT for valid credentials.

**Body**
```json
{ "email": "juan@test.com", "password": "password123" }
```

**Response — 200**
```json
{ "access_token": "eyJ..." }
```

**Errors**
- `401` — `Invalid credentials` (used for both unknown email and wrong password)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"password123"}'
```

### GET `/api/auth/profile`
Auth required (any role). Returns the authenticated user.

**Response — 200**
```json
{
  "id": "f7b7a353-773b-4b57-90fa-bf4f7cddd247",
  "name": "Juan Test",
  "email": "juan@test.com",
  "role": "User",
  "avatarUrl": null,
  "createdAt": "2026-04-26T01:11:09.000Z",
  "updatedAt": "2026-04-26T01:11:09.000Z"
}
```

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Users

### GET `/api/users`
**Admin** only. Returns every user (without `password`).

```bash
curl http://localhost:3000/api/users -H "Authorization: Bearer $ADMIN_TOKEN"
```

### GET `/api/users/:id`
Auth required. Returns the user with the given UUID.

**Errors**
- `404` — `User <id> not found`

### PATCH `/api/users/:id`
**Admin** only. Updates a user's fields. Body is `Partial<CreateUserDto>` — any subset of `name`, `email`, `password`, `role`, `avatarUrl`.

```bash
curl -X PATCH http://localhost:3000/api/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"Admin"}'
```

### DELETE `/api/users/:id`
**Admin** only. Removes the user.

**Errors**
- `404` — user doesn't exist

---

## Warehouses

### GET `/api/warehouses`
Auth required. Lists all warehouses.

### GET `/api/warehouses/:id`
Auth required.

**Errors**
- `404` — `Warehouse #<id> not found`

### POST `/api/warehouses`
**Admin** only.

**Body**
```json
{
  "name": "Hub North",
  "location": "Bogota",
  "capacity": 1000,
  "currentLoad": 0,
  "managerName": "Alex",
  "imageUrl": "https://..."
}
```

**Validation**
- `name` / `location` / `managerName`: non-empty, max 255
- `capacity`: integer ≥ 0
- `currentLoad`: integer ≥ 0 (optional, defaults to 0)
- `imageUrl`: optional string

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hub North","location":"Bogota","capacity":1000,"managerName":"Alex"}'
```

### PATCH `/api/warehouses/:id`
**Admin** only. `Partial<CreateWarehouseDto>`.

### DELETE `/api/warehouses/:id`
**Admin** only.

---

## Packages

### GET `/api/packages`
Auth required. Returns every package with `user` and `warehouse` eager-loaded.

```json
[
  {
    "id": "c7a683d5-79b9-410f-9b6f-8948e690a538",
    "description": "Test package",
    "status": "Pending",
    "price": 99.99,
    "createdAt": "2026-04-26T01:11:55.000Z",
    "updatedAt": "2026-04-26T01:11:55.000Z",
    "user":      { "id": "...", "name": "Juan Test", "email": "...", "role": "Admin", "avatarUrl": null, "createdAt": "...", "updatedAt": "..." },
    "warehouse": { "id": "...", "name": "Hub North", "location": "Bogota", "capacity": 1000, "currentLoad": 0, "managerName": "Alex", "imageUrl": null, "createdAt": "...", "updatedAt": "..." }
  }
]
```

### GET `/api/packages/:id`
Auth required.

**Errors**
- `404` — `Package <id> not found`

### POST `/api/packages`
Auth required.

**Body**
```json
{
  "description": "Industrial parts",
  "status": "Pending",
  "price": 99.99,
  "userId": "f7b7a353-773b-4b57-90fa-bf4f7cddd247",
  "warehouseId": "a83ea5d2-e6c3-45ab-b206-f90a53cc639f"
}
```

**Validation**
- `description`: non-empty, max 500
- `status`: must be one of `Pending`, `In Transit`, `Delivered`, `Exception`, `At Warehouse`
- `price`: number ≥ 0, max 2 decimals
- `userId` / `warehouseId`: must be valid UUIDs of existing rows (otherwise `404`)

### PATCH `/api/packages/:id`
Auth required. `Partial<CreatePackageDto>`. Reassigns `user` and `warehouse` if their IDs are sent.

### DELETE `/api/packages/:id`
Auth required. Cascades — all related `package_log` rows go with it.

---

## Package Logs

### GET `/api/package-logs`
Auth required. Returns every log with all three relations (`package`, `fromWarehouse`, `toWarehouse`) eager-loaded — and `package.user`, `package.warehouse` further nested.

### GET `/api/package-logs/by-package/:packageId`
Auth required. Returns only the logs for the given package (validates the package exists first; `404` if not).

```bash
curl "http://localhost:3000/api/package-logs/by-package/$PKG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### GET `/api/package-logs/:id`
Auth required.

### POST `/api/package-logs`
Auth required.

**Body**
```json
{
  "packageId": "c7a683d5-79b9-410f-9b6f-8948e690a538",
  "fromWarehouseId": "a83ea5d2-e6c3-45ab-b206-f90a53cc639f",
  "toWarehouseId": "63b8d915-c5ea-46ef-a0a7-1b4f995c27df",
  "previousStatus": "Pending",
  "newStatus": "In Transit",
  "description": "Picked up from origin"
}
```

**Validation**
- All three IDs must be valid UUID v4 strings of existing rows
- `previousStatus` / `newStatus`: optional, must be one of the five `PackageStatus` values
- `description`: optional, max 500
- **`fromWarehouseId !== toWarehouseId`** — the API rejects same-warehouse transfers with `400`

### PATCH `/api/package-logs/:id`
Auth required. `Partial<CreatePackageLogDto>`. The `from !== to` rule is re-validated against the resulting state (combining the old values with the new ones).

### DELETE `/api/package-logs/:id`
Auth required.

---

## End-to-end example: create a complete delivery chain

The default admin seeder creates `admin@packtrack.local` / `Admin12345!` on first boot, so we can log in directly without manual SQL promotion.

```bash
# 1. Login as the default admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@packtrack.local","password":"Admin12345!"}' | jq -r .access_token)

# 2. Create two warehouses
W1=$(curl -s -X POST http://localhost:3000/api/warehouses \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Origin","location":"Bogota","capacity":1000,"managerName":"Alex"}' | jq -r .id)
W2=$(curl -s -X POST http://localhost:3000/api/warehouses \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Destination","location":"Medellin","capacity":500,"managerName":"Maria"}' | jq -r .id)

# 3. Get the admin's own UUID (used as the package owner)
USER_ID=$(curl -s http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r .id)

# 4. Create a package starting at the origin warehouse
PKG=$(curl -s -X POST http://localhost:3000/api/packages \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d "{\"description\":\"Demo box\",\"status\":\"Pending\",\"price\":42,\"userId\":\"$USER_ID\",\"warehouseId\":\"$W1\"}" \
  | jq -r .id)

# 5. Log the move from origin to destination
curl -s -X POST http://localhost:3000/api/package-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d "{\"packageId\":\"$PKG\",\"fromWarehouseId\":\"$W1\",\"toWarehouseId\":\"$W2\",\"previousStatus\":\"Pending\",\"newStatus\":\"In Transit\",\"description\":\"Outbound\"}"

# 6. Inspect the package timeline
curl -s "http://localhost:3000/api/package-logs/by-package/$PKG" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[] | {from: .fromWarehouse.name, to: .toWarehouse.name, status: .newStatus}'
```

> Need a fresh User-role token instead? Register a new account via `POST /api/auth/register` and use the returned `access_token` directly — no admin promotion needed for User-level endpoints.

## Common error responses

| Status | When |
|---|---|
| `400` | Validation failure, unknown payload field, `from === to` on package logs |
| `401` | Missing/invalid/expired bearer token, wrong credentials |
| `403` | Endpoint requires `Admin` and the JWT carries `User` |
| `404` | Resource ID not found (User, Warehouse, Package, PackageLog) |
| `500` | Unhandled exception — check `npm run start:dev` logs |
