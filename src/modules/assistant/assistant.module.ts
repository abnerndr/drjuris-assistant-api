import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from 'src/entities/process.entity';
import { User } from 'src/entities/user.entity';
import { AwsModule } from '../aws/aws.module';
import { ProcessesModule } from '../processes/processes.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AnalyzerService } from './services/analyzer.service';
import { FileExtractorService } from './services/file-extractor.service';
import { ProviderService } from './services/provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process, User]),
    ProcessesModule,
    AwsModule,
  ],
  controllers: [AssistantController],
  providers: [
    AnalyzerService,
    FileExtractorService,
    AssistantService,
    ProviderService,
  ],
})
export class AssistantModule {}
