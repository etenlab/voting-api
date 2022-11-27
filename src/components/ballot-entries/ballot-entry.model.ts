import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Election } from '../elections/election.model';

@Entity('ballot_entries', { synchronize: false, schema: 'admin' })
@ObjectType()
export class BallotEntry {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => Election, (election) => election.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'election_id' })
  election: Election;

  @Column()
  @Field(() => Int)
  election_id: number;

  @Column({ default: 'site_text_keys' })
  @Field(() => String)
  table_name: string;

  @Column({ default: 0 })
  @Field(() => Int)
  row: number;

  @Column({ default: 'user_id' })
  @Field(() => String)
  created_by: string;
}
