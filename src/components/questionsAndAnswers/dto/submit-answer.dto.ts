import { InputType, Field } from '@nestjs/graphql';
import { AnswerInput } from './create-question.dto';

@InputType()
export class SubmitAnswerInput {
  @Field(() => Number) questionId: number;
  @Field(() => [AnswerInput]) answersInput: AnswerInput[];
  @Field(() => String) userId: string;
  @Field(() => String) type: string;
  @Field(() => Boolean, { nullable: true }) up?: boolean;
}
