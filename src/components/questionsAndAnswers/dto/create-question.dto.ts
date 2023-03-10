import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { Question } from '../question.model';

@InputType()
export class QuestionInput {
  @Field(() => Number) appId: number;
  @Field(() => String) userId: string;
  @Field(() => String) text: string;
  @Field(() => String) type: string;
  @Field(() => [AnswerInput], { nullable: true }) answers?: AnswerInput[];
}

@InputType()
export class AnswerInput {
  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => String, { nullable: true })
  feedback?: string;

  question?: Question;
}

@ObjectType()
export class QuestionOutput {
  @Field(() => Question) readonly question: Question;
}
