import { Module } from '@nestjs/common';
import { Registration } from './registration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
      imports:[TypeOrmModule.forFeature([Registration])],
        exports:[TypeOrmModule]
})
export class RegistrationModule {}
