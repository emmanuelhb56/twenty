import {
  CargoSyncException,
  CargoSyncExceptionCode,
} from 'src/engine/metadata-modules/cargo-sync/cargo-sync.exception';

export const cargoSyncGraphqlApiExceptionHandler = (error: Error): never => {
  if (error instanceof CargoSyncException) {
    throw error;
  }
  throw new CargoSyncException(error.message, CargoSyncExceptionCode.UNKNOWN);
};
