import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';

// Resultado devuelto al frontend tras sincronizar las etapas de Opportunity.
@ObjectType('SyncStagesResult')
export class SyncStagesResultDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  // Nuevas opciones del campo "stage" ya aplicadas (id, value, label, color,
  // position). Se devuelve como JSON para que el frontend pueda refrescar el
  // select sin recargar.
  @Field(() => GraphQLJSON)
  options: FieldMetadataComplexOption[];
}
