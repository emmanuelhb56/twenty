import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';

@ObjectType('SyncCargosResult')
export class SyncCargosResultDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => GraphQLJSON)
  options: FieldMetadataComplexOption[];
}
