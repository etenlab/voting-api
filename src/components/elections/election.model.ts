import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('elections', { synchronize: false })
@Unique(['app_id', 'name'])
@ObjectType()
export class Election {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  app_id: number;

  @Column()
  @Field(() => String)
  name: string;

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
