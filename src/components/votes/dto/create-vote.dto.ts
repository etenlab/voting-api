import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Vote } from '../vote.model';

@InputType()
export class VoteInput {
  @Field(() => Int) ballot_entry_id: number;
  @Field(() => String) user_id: string;
  @Field(() => Boolean) up: boolean;
}

@ObjectType()
export class VoteOutput {
  @Field(() => Vote) readonly vote: Vote;
}
