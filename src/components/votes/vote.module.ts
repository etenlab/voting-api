import { Module } from '@nestjs/common';
import { Votable, Vote } from './vote.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteResolver } from './vote.resolver';
import { VoteService } from './vote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Votable])],
  providers: [VoteResolver, VoteService],
})
export class VoteModule {}
