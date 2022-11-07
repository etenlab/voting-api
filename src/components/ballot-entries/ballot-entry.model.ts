import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ballot } from '../ballots/ballot.model';

@Entity('ballot_entries', { synchronize: false })
@ObjectType()
export class BallotEntry {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  @ManyToOne(() => Ballot, (ballot) => ballot.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ballot_id' })
  ballot_id: number;

  @Column()
  @Field(() => String)
  table_name: string;

  @Column()
  @Field(() => Int)
  row: number;

  @Column()
  @Field(() => String)
  created_by: string;
}
