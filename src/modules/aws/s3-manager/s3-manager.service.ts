import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { GenerateRandomId } from 'src/shared/utils/generate-random-id';

@Injectable()
export class S3ManagerService {
  private readonly logger = new Logger(S3ManagerService.name);
  private isAwsConfigured = false;

  constructor(@InjectAwsService(S3) private readonly s3: S3) {
    this.checkAwsConfiguration();
  }

  private checkAwsConfiguration() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    this.isAwsConfigured = !!(accessKeyId && secretAccessKey);

    if (!this.isAwsConfigured) {
      this.logger.warn(
        'AWS credentials not configured. S3 operations will fail.',
      );
    } else {
      this.logger.log('AWS S3 service initialized successfully');
    }
  }

  private validateAwsConfiguration() {
    if (!this.isAwsConfigured) {
      throw new Error(
        'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.',
      );
    }
  }

  async listBucketContents(bucket: string) {
    this.validateAwsConfiguration();

    try {
      this.logger.log(`Listing contents of bucket: ${bucket}`);
      const response = await this.s3
        .listObjectsV2({ Bucket: bucket })
        .promise();
      return response.Contents?.map((c) => c.Key) ?? [];
    } catch (error) {
      this.logger.error(`Failed to list bucket contents: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, bucket: string) {
    this.validateAwsConfiguration();
    const randomId = GenerateRandomId.generate(file.originalname);
    const fileName = `${randomId}${file.mimetype.split('/')[1]}`;
    try {
      this.logger.log(`Uploading file to S3: ${bucket}/${fileName}`);
      const response = await this.s3
        .upload({
          Bucket: bucket,
          Key: fileName,
          Body: file.buffer,
        })
        .promise();
      this.logger.log(`File uploaded successfully: ${response.Location}`);
      return response.Location;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw error;
    }
  }
}
