// External imports
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';

// Internal imports
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost',
  'http://127.0.0.1',
];

const DEFAULT_ADMIN_NAME = 'Admin User';
const DEFAULT_ADMIN_EMAIL = 'admin@packtrack.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin12345!';

async function seedDefaultAdmin(app: INestApplication): Promise<void> {
  const seedEnabled = (process.env.SEED_ADMIN_ENABLED ?? 'true') === 'true';
  if (!seedEnabled) {
    return;
  }

  const name = process.env.SEED_ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME;
  const email =
    process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || DEFAULT_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const usersService = app.get(UsersService);
  const existingAdmin = await usersService.findByEmail(email);
  if (existingAdmin) {
    return;
  }

  await usersService.create({
    name,
    email,
    password,
    role: 'Admin',
  });

  Logger.log(
    `Seeded default admin account: ${email}`,
    'Bootstrap',
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) =>
    origin.trim(),
  );

  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : DEFAULT_CORS_ORIGINS,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await seedDefaultAdmin(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
