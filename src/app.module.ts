import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'orbware.com.br',
      port: 3306,
      username: 'orbwar77_admin',
      password: '123Mudar!',
      database: 'orbwar77_ictus',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Em produção, altere para "false"
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
