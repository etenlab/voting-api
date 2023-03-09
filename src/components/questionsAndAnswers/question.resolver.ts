import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { QuestionInput, QuestionOutput } from './dto/create-question.dto';
import { Question, QuestionType } from './question.model';
import { VoteOutput } from '../votes/dto/create-vote.dto';
import { SubmitAnswerInput } from './dto/submit-answer.dto';

@Resolver(Question)
export class QuestionResolver {
  constructor(private readonly service: QuestionService) {}

  @Mutation(() => QuestionOutput)
  async createQuestion(
    @Args('input') input: QuestionInput,
  ): Promise<QuestionOutput> {
    const question = await this.service.createQuestion(input);
    return { question };
  }

  @Query(() => Question)
  async question(@Args('id') id: number): Promise<Question> {
    return await this.service.getQuestion(id);
  }

  @Query(() => [Question])
  async questions(): Promise<Question[]> {
    return await this.service.getQuestions();
  }

  @Mutation(() => [VoteOutput])
  async submit(@Args('input') input: SubmitAnswerInput): Promise<VoteOutput[]> {
    const votes = await this.service.submitAnswer(input);
    return votes.map((vote) => {
      return { vote };
    });
  }

  @Mutation(() => QuestionType)
  async addQuestionType(@Args('type') type: string): Promise<QuestionType> {
    return await this.service.addQuestionType(type);
  }
}
