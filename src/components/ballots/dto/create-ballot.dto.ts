import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Ballot } from '../ballot.model';

@InputType()
export class BallotInput {
  @Field(() => Int) app_id: number;
  @Field(() => String) name: string;
  @Field(() => String) created_by: string;
}

@ObjectType()
export class BallotOutput {
  @Field(() => Ballot) readonly ballot: Ballot;
}
