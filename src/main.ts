import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { frontUrl } from './constants/front.url';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [frontUrl],
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
