import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import {
  CargoSyncException,
  CargoSyncExceptionCode,
} from 'src/engine/metadata-modules/cargo-sync/cargo-sync.exception';
import { SyncCargosResultDTO } from 'src/engine/metadata-modules/cargo-sync/dtos/sync-cargos-result.dto';
import { type WebhookCargosResponse } from 'src/engine/metadata-modules/cargo-sync/dtos/webhook-cargos-response.type';
import { mapWebhookResponseToCargoOptions } from 'src/engine/metadata-modules/cargo-sync/utils/map-webhook-response-to-cargo-options.util';

const PERSON_OBJECT_NAME_SINGULAR = 'person';
const CARGO_FIELD_NAME = 'jerarquia';
const WEBHOOK_TIMEOUT_MS = 10_000;

// Valor placeholder que se inserta al crear el campo por primera vez.
// Si el campo solo tiene este valor, se considera "no sincronizado aún".
const PLACEHOLDER_VALUE = 'PLACEHOLDER';

@Injectable()
export class CargoSyncService {
  private readonly logger = new Logger(CargoSyncService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  async syncCargosIfPlaceholder(
    workspaceId: string,
  ): Promise<SyncCargosResultDTO | null> {
    const cargoField = await this.fieldMetadataService.findOneWithinWorkspace(
      workspaceId,
      {
        where: {
          name: CARGO_FIELD_NAME,
          object: { nameSingular: PERSON_OBJECT_NAME_SINGULAR },
        },
        relations: { object: true },
      },
    );

    if (!isDefined(cargoField)) {
      this.logger.warn(
        `Workspace ${workspaceId}: person "jerarquia" field not found — skipping cargo sync`,
      );
      return null;
    }

    const currentValues: string[] = (cargoField.options ?? []).map(
      (o) => (o as { value: string }).value,
    );

    const isPlaceholder =
      currentValues.length === 1 && currentValues[0] === PLACEHOLDER_VALUE;
    const isEmpty = currentValues.length === 0;

    if (!isPlaceholder && !isEmpty) {
      this.logger.log(
        `Workspace ${workspaceId}: cargos already synced — skipping auto-sync`,
      );
      return null;
    }

    return this.syncCargos(workspaceId);
  }

  async syncCargos(workspaceId: string): Promise<SyncCargosResultDTO> {
    const webhookUrl = this.twentyConfigService.get('CARGO_SYNC_WEBHOOK_URL');

    if (!isDefined(webhookUrl) || webhookUrl.trim() === '') {
      throw new CargoSyncException(
        'CARGO_SYNC_WEBHOOK_URL is not configured',
        CargoSyncExceptionCode.WEBHOOK_URL_NOT_CONFIGURED,
      );
    }

    const rawResponse = await this.fetchCargosFromWebhook(webhookUrl, workspaceId);
    const options = this.mapResponseOrThrow(rawResponse);

    const cargoField = await this.fieldMetadataService.findOneWithinWorkspace(
      workspaceId,
      {
        where: {
          name: CARGO_FIELD_NAME,
          object: { nameSingular: PERSON_OBJECT_NAME_SINGULAR },
        },
        relations: { object: true },
      },
    );

    if (!isDefined(cargoField)) {
      throw new CargoSyncException(
        'Person "jerarquia" field not found',
        CargoSyncExceptionCode.CARGO_FIELD_NOT_FOUND,
      );
    }

    const updateFieldInput: Omit<UpdateFieldInput, 'workspaceId'> = {
      id: cargoField.id,
      options,
      defaultValue: null,
    };

    await this.fieldMetadataService.updateOneField({ updateFieldInput, workspaceId });

    if (options.length === 0) {
      this.logger.warn(
        `Workspace ${workspaceId}: cargo webhook returned 0 options — jerarquia field left empty`,
      );
    }

    return {
      success: true,
      message: options.length > 0
        ? `Se sincronizaron ${options.length} cargo${options.length === 1 ? '' : 's'} correctamente.`
        : 'El webhook no devolvió cargos. Verifica que el catálogo externo tenga datos.',
      options,
    };
  }

  private async fetchCargosFromWebhook(
    webhookUrl: string,
    workspaceId: string,
  ): Promise<WebhookCargosResponse> {
    try {
      const client = this.secureHttpClientService.getHttpClient(
        { timeout: WEBHOOK_TIMEOUT_MS },
        { workspaceId, source: 'cargo-sync' },
      );
      const response = await client.get<WebhookCargosResponse>(webhookUrl);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cargo sync webhook request failed: ${message}`);
      throw new CargoSyncException(
        `Could not reach the cargos webhook: ${message}`,
        CargoSyncExceptionCode.WEBHOOK_REQUEST_FAILED,
      );
    }
  }

  private mapResponseOrThrow(rawResponse: WebhookCargosResponse) {
    try {
      return mapWebhookResponseToCargoOptions(rawResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new CargoSyncException(message, CargoSyncExceptionCode.INVALID_WEBHOOK_RESPONSE);
    }
  }
}
