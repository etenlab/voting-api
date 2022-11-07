import { Module } from '@nestjs/common';
import { Vote } from './vote.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteResolver } from './vote.resolver';
import { VoteService } from './vote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vote])],
  providers: [VoteResolver, VoteService],
})
export class VoteModule {}
