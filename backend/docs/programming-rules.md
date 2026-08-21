# Backend Programming Rules

## General Rules

### Case and Naming

- Folders in the `src/` path use plural names and group files by domain (`users/`, `warehouses/`, `packages/`, `package-logs/`, `auth/`).
- DTO file names use kebab-case with NestJS suffixes (e.g. `create-user.dto.ts`).
- Classes, interfaces, and type aliases use PascalCase.
- Variables and functions use camelCase.

### Imports

- External imports go first.
- Internal imports go after external imports.
- Keep one blank line between import blocks.
- Add import block comments:

```ts
// External imports
// Internal imports
```

- Prefer type-only imports when importing only types.

### Typing

- Type all function parameters and return types explicitly.
- Use `Promise<T>` return types for async controller and service methods.
- Put reusable domain unions and aliases in `src/types`.
- Put shared interfaces in `src/interfaces`.

## Project Structure

- Follow a feature-based module structure (based on the classes of the class diagram).
- Each feature should contain:
  - module
  - controller
  - service
  - dto
  - entities
- Register every feature module in `AppModule`.

## Bootstrap and Global Config

- Keep the global API prefix as `api`.
- Configure CORS explicitly with allowed origins.
- Use `ValidationPipe` globally with:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`

## Controllers

- Keep controllers thin: route mapping and request/response orchestration only.
- Do not place domain or business logic in controllers.
- Use Nest decorators consistently: `@Controller`, `@Get`, `@Post`, `@Patch`, `@Delete`, `@Param`, `@Body`.
- Delegate all business work to the corresponding service.
- Keep explicit response types in method signatures.
- Apply guards at controller or route level for protected endpoints.

## Services

- Place business rules and validations in services.
- Use constructor injection for dependencies.
- Use TypeORM repositories via `@InjectRepository` in services.
- Validate entity existence before update or remove operations.
- Throw Nest HTTP exceptions when business rules fail (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `BadRequestException`).
- Keep private helper methods for repeated lookup logic.

## DTOs and Validation

- Use class-based DTOs for all input contracts.
- Validate DTO fields with class-validator decorators.
- Use class-transformer's `@Type` for runtime conversion (for example `Date` and `Number`).
- Keep update DTOs as `PartialType(createDto)`.

## Entities and Persistence

- Use TypeORM decorators for all entities and columns.
- Use UUID primary keys with `@PrimaryGeneratedColumn('uuid')`.
- Define explicit column constraints (`length`, `unique`, `nullable`, `type`).
- Include `createdAt` and `updatedAt` timestamps with TypeORM date decorators.
- Define relationships explicitly (`ManyToOne`, `OneToMany`, `JoinColumn`) and keep relation typing strict.

## Authentication and Authorization

- Keep auth behavior inside the `auth` module (controller, service, guard, constants, DTOs).
- Use JWT via `JwtModule` and `JwtService`.
- Keep token extraction in guard helpers (Bearer token from the `Authorization` header).
- Attach the validated JWT payload to `request.user` in the guard.
- Keep protected routes behind `AuthGuard`.

## Error Handling

- Prefer framework exceptions over manual error responses.
- Use clear and domain-specific error messages.
- Fail fast on invalid references (for example missing related entities).
