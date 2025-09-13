import { Module } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

const getAwsConfig = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  // Se as credenciais AWS não estiverem disponíveis, retorna configuração básica
  if (!accessKeyId || !secretAccessKey) {
    console.warn('AWS credentials not found. AWS services will be disabled.');
    return {
      defaultServiceOptions: {
        region,
      },
      services: [],
    };
  }

  console.log(`AWS configured with region: ${region}`);
  return {
    defaultServiceOptions: {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    },
    services: [S3],
  };
};

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRoot(getAwsConfig()),
  ],
  exports: [S3ManagerModule],
})
export class AwsModule {}
