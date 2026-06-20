import { msg } from '@lingui/core/macro';
import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export enum CargoSyncExceptionCode {
  WEBHOOK_URL_NOT_CONFIGURED = 'WEBHOOK_URL_NOT_CONFIGURED',
  WEBHOOK_REQUEST_FAILED = 'WEBHOOK_REQUEST_FAILED',
  INVALID_WEBHOOK_RESPONSE = 'INVALID_WEBHOOK_RESPONSE',
  CARGO_FIELD_NOT_FOUND = 'CARGO_FIELD_NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export class CargoSyncException extends BaseGraphQLError {
  constructor(message: string, code: CargoSyncExceptionCode) {
    super(message, code);
  }

  override getUserFriendlyMessage() {
    switch (this.extensions.code as CargoSyncExceptionCode) {
      case CargoSyncExceptionCode.WEBHOOK_URL_NOT_CONFIGURED:
        return msg`CARGO_SYNC_WEBHOOK_URL no está configurado en el servidor.`;
      case CargoSyncExceptionCode.WEBHOOK_REQUEST_FAILED:
        return msg`No se pudo conectar con el webhook de cargos.`;
      case CargoSyncExceptionCode.INVALID_WEBHOOK_RESPONSE:
        return msg`La respuesta del webhook de cargos no tiene el formato esperado.`;
      case CargoSyncExceptionCode.CARGO_FIELD_NOT_FOUND:
        return msg`El campo "jerarquia" no fue encontrado en el objeto Person.`;
      default:
        return msg`Ocurrió un error al sincronizar los cargos.`;
    }
  }
}
