import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { BallotModule } from './components/ballots/ballot.module';
import { BallotEntryModule } from './components/ballot-entries/ballot-entry.module';
import { VoteModule } from './components/votes/vote.module';
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: true,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    TypeOrmModule.forRoot({
      keepConnectionAlive: true,
      schema: 'admin',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'asdfasdf',
      database: 'eil_db_1',
      autoLoadEntities: true,
      synchronize: true,
    }),
    BallotModule,
    BallotEntryModule,
    VoteModule,
  ],
})
export class AppModule {}
