import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        if (validationErrors.length > 0 && validationErrors[0].constraints) {
          const message = Object.values(validationErrors[0].constraints)[0];
          return new BadRequestException(message);
        }
        return new BadRequestException('Validation failed');
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
