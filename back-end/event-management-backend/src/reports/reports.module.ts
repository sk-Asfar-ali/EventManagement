import { Module } from '@nestjs/common';
import { Report } from './reports.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Report])],
    exports:[TypeOrmModule]

})
export class ReportsModule {}
