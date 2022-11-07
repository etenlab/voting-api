import { Module } from '@nestjs/common';
import { BallotResolver } from './ballot.resolver';
import { BallotService } from './ballot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ballot } from './ballot.model';

@Module({
  imports: [TypeOrmModule.forFeature([Ballot])],
  providers: [BallotResolver, BallotService],
})
export class BallotModule {}
