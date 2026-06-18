import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  StageSyncException,
  StageSyncExceptionCode,
} from 'src/engine/metadata-modules/stage-sync/stage-sync.exception';

// Traduce las excepciones del módulo de sincronización de etapas a errores
// GraphQL con un mensaje legible para el usuario (userFriendlyMessage).
export const stageSyncGraphqlApiExceptionHandler = (error: Error): never => {
  if (error instanceof StageSyncException) {
    switch (error.code) {
      case StageSyncExceptionCode.STAGE_FIELD_NOT_FOUND:
        throw new NotFoundError(error);
      case StageSyncExceptionCode.INVALID_WEBHOOK_RESPONSE:
        throw new UserInputError(error);
      case StageSyncExceptionCode.WEBHOOK_URL_NOT_CONFIGURED:
      case StageSyncExceptionCode.WEBHOOK_REQUEST_FAILED:
      case StageSyncExceptionCode.INTERNAL_SERVER_ERROR:
        throw new InternalServerError(error);
      default:
        throw new InternalServerError(error);
    }
  }

  throw error;
};
