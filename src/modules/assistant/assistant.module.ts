import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Process } from "src/entities/process.entity";
import { AssistantController } from "./assistant.controller";
import { AssistantService } from "./assistant.service";
import { AnalyzerService } from "./services/analyzer.service";
import { FileExtractorService } from "./services/file-extractor.service";

@Module({
    imports: [TypeOrmModule.forFeature([Process])],
    controllers: [AssistantController],
    providers: [AnalyzerService, FileExtractorService, AssistantService],
})
export class AssistantModule {}