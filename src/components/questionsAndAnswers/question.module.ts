import { Module } from '@nestjs/common';
import { QuestionResolver } from './question.resolver';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question, QuestionType } from './question.model';
import { Answer } from './answer.model';
import { Election } from '../elections/election.model';
import { BallotEntry } from '../ballot-entries/ballot-entry.model';
import { Vote } from '../votes/vote.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionType,
      Answer,
      Election,
      BallotEntry,
      Vote,
    ]),
  ],
  providers: [QuestionResolver, QuestionService],
})
export class QuestionModule {}
