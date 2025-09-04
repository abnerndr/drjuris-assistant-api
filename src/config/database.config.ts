import { registerAs } from "@nestjs/config";
import { Process } from "src/entities/process.entity";

export default registerAs('database', () => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  entities: [Process],
}));