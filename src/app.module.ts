import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { ElectionModule } from './components/elections/election.module';
import { BallotEntryModule } from './components/ballot-entries/ballot-entry.module';
import { VoteModule } from './components/votes/vote.module';
import { QuestionModule } from './components/questionsAndAnswers/question.module';
import { AppController } from './app.controller';
dotenv.config();

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
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
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ElectionModule,
    BallotEntryModule,
    QuestionModule,
    VoteModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
