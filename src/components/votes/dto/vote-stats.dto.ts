import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VoteStat {
  @Field(() => Int)
  row: number;

  @Field(() => Int)
  ballot_entry_id: number;

  @Field(() => Int)
  down: number;

  @Field(() => Int)
  up: number;
}
