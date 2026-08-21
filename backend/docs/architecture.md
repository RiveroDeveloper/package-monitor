# Architecture

This backend follows a **feature-module** layout where each domain entity (User, Warehouse, Package, PackageLog) lives in its own NestJS module with a fixed shape:

```
<feature>/
├── <feature>.module.ts       # NestJS module definition
├── <feature>.controller.ts   # HTTP route handlers (thin)
├── <feature>.service.ts      # Business logic + repository access
├── dto/
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts   # PartialType(CreateXxxDto)
└── entities/
    └── <feature>.entity.ts   # TypeORM entity
```

Cross-module dependencies are explicit: a service from module A receives the service of module B via constructor injection, and module A imports module B in its `@Module({ imports })`.

## Request lifecycle

```mermaid
flowchart LR
    Client[HTTP request] --> CORS
    CORS --> VP[ValidationPipe<br/>whitelist + forbid + transform]
    VP --> AG[AuthGuard<br/>verifies JWT]
    AG --> RG[RolesGuard<br/>checks role metadata]
    RG --> Ctrl[Controller<br/>thin route handler]
    Ctrl --> Svc[Service<br/>business rules]
    Svc --> Repo[(TypeORM Repository)]
    Repo --> SQLite[(SQLite)]
    SQLite --> Repo
    Repo --> Svc
    Svc --> Ctrl
    Ctrl --> CSI[ClassSerializerInterceptor<br/>strips @Exclude fields]
    CSI --> Resp[HTTP response]
```

Guards run in order; if either fails the request is short-circuited (`401` from AuthGuard, `403` from RolesGuard) and never reaches the controller.

## Module dependency graph

```mermaid
flowchart TD
    AppModule --> TypeOrmRoot[TypeOrmModule.forRoot]
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> WarehousesModule
    AppModule --> PackagesModule
    AppModule --> PackageLogsModule

    AuthModule --> UsersModule
    AuthModule --> JwtModule

    PackagesModule --> UsersModule
    PackagesModule --> WarehousesModule

    PackageLogsModule --> PackagesModule
    PackageLogsModule --> WarehousesModule

    classDef root fill:#1e3a8a,stroke:#1e40af,color:#fff
    classDef feature fill:#0f766e,stroke:#0d9488,color:#fff
    classDef external fill:#52525b,stroke:#71717a,color:#fff

    class AppModule root
    class AuthModule,UsersModule,WarehousesModule,PackagesModule,PackageLogsModule feature
    class TypeOrmRoot,JwtModule external
```

`UsersModule` and `WarehousesModule` `export` their service so downstream modules can inject them without circular imports. `PackagesModule` re-exports `PackagesService` so `PackageLogsModule` can resolve a `Package` by id when validating log creation.

## Class diagram (domain model)

```mermaid
classDiagram
    class User {
        +UUID id
        +string name
        +string email
        +string password
        +Role role
        +string? avatarUrl
        +Date createdAt
        +Date updatedAt
        +Package[] packages
        +login()
        +register()
    }

    class Warehouse {
        +UUID id
        +string name
        +string location
        +int capacity
        +int currentLoad
        +string managerName
        +string? imageUrl
        +Date createdAt
        +Date updatedAt
        +Package[] packages
        +PackageLog[] fromWarehouseLogs
        +PackageLog[] toWarehouseLogs
        +getWarehouses()
        +getWarehouseById()
    }

    class Package {
        +UUID id
        +string description
        +PackageStatus status
        +decimal price
        +Date createdAt
        +Date updatedAt
        +User user
        +Warehouse warehouse
        +PackageLog[] logs
        +createPackage()
        +getPackages()
    }

    class PackageLog {
        +UUID id
        +PackageStatus? previousStatus
        +PackageStatus? newStatus
        +string? description
        +Date timestamp
        +Package package
        +Warehouse fromWarehouse
        +Warehouse toWarehouse
        +createPackageLog()
        +getPackageLogsByPackageId()
    }

    class Role {
        <<enumeration>>
        Admin
        User
    }

    class PackageStatus {
        <<enumeration>>
        Pending
        In_Transit
        Delivered
        Exception
        At_Warehouse
    }

    User "1" --> "0..*" Package : owns
    Warehouse "1" --> "0..*" Package : stores
    Package "1" --> "0..*" PackageLog : history
    Warehouse "1" --> "0..*" PackageLog : fromWarehouse
    Warehouse "1" --> "0..*" PackageLog : toWarehouse
    User ..> Role : uses
    Package ..> PackageStatus : uses
    PackageLog ..> PackageStatus : uses
```

### Cardinality summary

| From | Direction | To | Decorator on the *many* side |
|---|---|---|---|
| User | 1 — 0..* | Package | `@ManyToOne(() => User, u => u.packages, { eager: true })` |
| Warehouse | 1 — 0..* | Package | `@ManyToOne(() => Warehouse, w => w.packages, { eager: true })` |
| Package | 1 — 0..* | PackageLog | `@ManyToOne(() => Package, p => p.logs, { eager: true, onDelete: 'CASCADE' })` |
| Warehouse | 1 — 0..* | PackageLog (`fromWarehouse`) | `@ManyToOne(() => Warehouse, w => w.fromWarehouseLogs, { eager: true })` |
| Warehouse | 1 — 0..* | PackageLog (`toWarehouse`) | `@ManyToOne(() => Warehouse, w => w.toWarehouseLogs, { eager: true })` |

`eager: true` means TypeORM auto-joins the parent on every query, so a `GET /api/packages` already returns nested `user` and `warehouse` objects without a custom `.find({ relations: [...] })`.

`onDelete: 'CASCADE'` on the `PackageLog → Package` relation means deleting a package wipes its logs automatically (the timeline becomes invalid without the parent).

> **Note on PackageStatus values:** the enum is rendered with underscores in the diagram (`In_Transit`, `At_Warehouse`) because Mermaid does not allow spaces in enumeration members. The actual string values stored in the database and accepted by the API contain spaces: `'Pending'`, `'In Transit'`, `'Delivered'`, `'Exception'`, `'At Warehouse'`. See `src/types/PackageTypes.ts`.

## Entity-relationship diagram (database)

```mermaid
erDiagram
    USER ||--o{ PACKAGE : owns
    WAREHOUSE ||--o{ PACKAGE : stores
    PACKAGE ||--o{ PACKAGE_LOG : "history (CASCADE on delete)"
    WAREHOUSE ||--o{ PACKAGE_LOG : "fromWarehouse"
    WAREHOUSE ||--o{ PACKAGE_LOG : "toWarehouse"

    USER {
        uuid id PK
        varchar name "len 255"
        varchar email UK "len 255, lowercased"
        varchar password "bcrypt hash, never serialized"
        varchar role "Admin or User"
        varchar avatarUrl "nullable"
        datetime createdAt
        datetime updatedAt
    }

    WAREHOUSE {
        uuid id PK
        varchar name "len 255"
        varchar location "len 255"
        int capacity
        int currentLoad "default 0"
        varchar managerName "len 255"
        varchar imageUrl "nullable"
        datetime createdAt
        datetime updatedAt
    }

    PACKAGE {
        uuid id PK
        varchar description "len 500"
        varchar status "PackageStatus union, len 20"
        decimal price "10,2"
        datetime createdAt
        datetime updatedAt
        uuid userIdId FK "join column"
        uuid warehouseIdId FK "join column"
    }

    PACKAGE_LOG {
        uuid id PK
        varchar previousStatus "nullable, len 20"
        varchar newStatus "nullable, len 20"
        varchar description "nullable, len 500"
        datetime timestamp "fills on insert"
        uuid packageIdId FK
        uuid fromWarehouseIdId FK
        uuid toWarehouseIdId FK
    }
```

> **Note on column names:** TypeORM generates join columns as `<relationName>Id` by default. With `synchronize: true` and `@JoinColumn()` left blank, you may see the actual columns as `userId`, `warehouseId`, `packageId`, `fromWarehouseId`, `toWarehouseId`. The duplication in the diagram (`userIdId`) is just to make the FK relationship visually obvious.

## Folder + file conventions

| Convention | Why |
|---|---|
| Folders plural (`users/`, `packages/`) | Matches NestJS schematics output and the team rulebook |
| One entity per file under `entities/` | Keeps imports unambiguous |
| `kebab-case.dto.ts` filenames | Avoids OS-case-sensitivity issues |
| `UpdateXxxDto extends PartialType(CreateXxxDto)` | Single source of truth for fields |
| `import type { Foo }` for unions/interfaces | TypeScript erases these at runtime — zero JS impact |
| Explicit `Promise<T>` return types | Lint rule `no-floating-promises` benefits, and clarifies async contracts |
| Constructor injection only | NestJS DI requires it; no `static` services |
| `@InjectRepository(Entity)` in services | Standard TypeORM ↔ NestJS bridge |
| Throw `NotFoundException` / `ConflictException` / `BadRequestException` from services | NestJS converts to 404/409/400 automatically |

## Persistence layer notes

- TypeORM `synchronize: true` is enabled. Schema changes auto-apply on app boot. **Do not enable this in production** — it can drop columns silently.
- `autoLoadEntities: true` discovers entities through `@Module({ imports: [TypeOrmModule.forFeature([Entity])] })`. No `entities: [...]` array is needed at the root level.
- The DB file lives at the project root (`backend/database.sqlite`) by default. Override with `SQLITE_PATH=...` when launching.
- WAL/journal files (`*.sqlite-journal`, `*.sqlite-wal`, `*.sqlite-shm`) are gitignored.
- **Default admin seeder**: on every boot, `seedDefaultAdmin()` in `src/main.ts` checks whether an admin account exists; if not, it creates one with credentials read from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults: `admin@packtrack.local` / `Admin12345!`). Set `SEED_ADMIN_ENABLED=false` to disable.

## Where to read the code

| Concern | Entry point |
|---|---|
| Bootstrap, CORS, global pipe + interceptor, default admin seeder | `src/main.ts` |
| Database connection + module list | `src/app.module.ts` |
| JWT signing config | `src/auth/auth.module.ts` (uses `src/auth/constants.ts`) |
| AuthGuard (token verification) | `src/auth/auth.guard.ts` |
| RolesGuard (role enforcement) | `src/auth/guards/roles.guard.ts` |
| `@Roles('Admin')` decorator | `src/auth/decorators/roles.decorator.ts` |
| Shared types | `src/types/UsersTypes.ts`, `src/types/PackageTypes.ts` |

For details on the auth flow, see [`authentication.md`](./authentication.md). For an endpoint-by-endpoint reference, see [`api-reference.md`](./api-reference.md).
