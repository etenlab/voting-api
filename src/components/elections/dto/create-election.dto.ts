import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Election } from '../election.model';

@InputType()
export class ElectionInput {
  @Field(() => Int) app_id: number;
  @Field(() => String) name: string;
  @Field(() => String) created_by: string;
  @Field(() => String) table_name: string;
  @Field(() => Int) row: number;
}

@InputType()
export class ElectionIdInput {
  @Field(() => String) table_name: string;
  @Field(() => Int) row: number;
}

@ObjectType()
export class ElectionOutput {
  @Field(() => Election) readonly election: Election;
}
