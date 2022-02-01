import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommissionModule } from './commission/commission.module';

async function bootstrap() {
  const app = await NestFactory.create(CommissionModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MoneyGrabber API.')
    .setDescription(
      'Send your money to this API and magically lose part of it!',
    )
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/', app, swaggerDocument);

  await app.listen(3000);
}
bootstrap();
