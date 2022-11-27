import { Module } from '@nestjs/common';
import { ElectionResolver } from './election.resolver';
import { ElectionService } from './election.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from './election.model';

@Module({
  imports: [TypeOrmModule.forFeature([Election])],
  providers: [ElectionResolver, ElectionService],
})
export class ElectionModule {}
