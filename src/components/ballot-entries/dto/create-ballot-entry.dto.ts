import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BallotEntry } from '../ballot-entry.model';

@InputType()
export class BallotEntryInput {
  @Field(() => Int) election_id: number;
  @Field(() => String) table_name: string;
  @Field(() => Int) row: number;
  @Field(() => String) created_by: string;
}

@ObjectType()
export class BallotEntryOutput {
  @Field(() => BallotEntry) readonly ballotEntry: BallotEntry;
}
