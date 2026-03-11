import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Habilita confiança no proxy (essencial para Railway/Render/Vercel lerem HTTPS e IPs corretamente)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL must be defined');
  }

  app.enableCors({
    origin: frontendUrl ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
