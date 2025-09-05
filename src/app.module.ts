import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigModule } from './config/database/database.config';
import { AssistantModule } from './modules/assistant/assistant.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseConfigModule,
    AuthModule,
    UsersModule,
    AssistantModule,
  ],
})
export class AppModule {}
