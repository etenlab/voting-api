import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateVote {
  @Field(() => Int) vote_id: number;
  @Field(() => String) user_id: string;
  @Field(() => Boolean) up: boolean;
}
