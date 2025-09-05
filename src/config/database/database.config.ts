/* eslint-disable @typescript-eslint/require-await */
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Process } from 'src/entities/process.entity';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get('DATABASE_URL'),
          synchronize: configService.get('NODE_ENV') === 'development',
          entities: [Process, User, Role, Permission],
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Process, User, Role, Permission]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseConfigModule {}
