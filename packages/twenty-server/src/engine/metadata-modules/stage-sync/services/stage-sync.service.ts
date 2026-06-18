import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { SyncStagesResultDTO } from 'src/engine/metadata-modules/stage-sync/dtos/sync-stages-result.dto';
import { type WebhookStagesResponse } from 'src/engine/metadata-modules/stage-sync/dtos/webhook-stages-response.type';
import {
  StageSyncException,
  StageSyncExceptionCode,
} from 'src/engine/metadata-modules/stage-sync/stage-sync.exception';
import { mapWebhookResponseToStageOptions } from 'src/engine/metadata-modules/stage-sync/utils/map-webhook-response-to-stage-options.util';

const OPPORTUNITY_OBJECT_NAME_SINGULAR = 'opportunity';
const STAGE_FIELD_NAME = 'stage';
const WEBHOOK_TIMEOUT_MS = 10_000;

@Injectable()
export class StageSyncService {
  private readonly logger = new Logger(StageSyncService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  // Sincroniza las opciones del campo "stage" de Opportunity con el catálogo
  // que devuelve el webhook externo. Reemplazo TOTAL (sin merge).
  async syncOpportunityStages(
    workspaceId: string,
  ): Promise<SyncStagesResultDTO> {
    const webhookUrl = this.twentyConfigService.get('STAGES_SYNC_WEBHOOK_URL');

    if (!isDefined(webhookUrl) || webhookUrl.trim() === '') {
      throw new StageSyncException(
        'STAGES_SYNC_WEBHOOK_URL is not configured',
        StageSyncExceptionCode.WEBHOOK_URL_NOT_CONFIGURED,
      );
    }

    const rawResponse = await this.fetchStagesFromWebhook(
      webhookUrl,
      workspaceId,
    );

    const options = this.mapResponseOrThrow(rawResponse);

    const stageField = await this.fieldMetadataService.findOneWithinWorkspace(
      workspaceId,
      {
        where: {
          name: STAGE_FIELD_NAME,
          object: { nameSingular: OPPORTUNITY_OBJECT_NAME_SINGULAR },
        },
        relations: { object: true },
      },
    );

    if (!isDefined(stageField)) {
      throw new StageSyncException(
        'Opportunity "stage" field not found',
        StageSyncExceptionCode.STAGE_FIELD_NOT_FOUND,
      );
    }

    // Full replacement of options + update defaultValue to first new option
    // (field is non-nullable, its default must exist among the new options).
    // Twenty stores SELECT defaultValue wrapped in single quotes.
    const updateFieldInput: Omit<UpdateFieldInput, 'workspaceId'> = {
      id: stageField.id,
      options,
      defaultValue: `'${options[0].value}'`,
    };

    await this.fieldMetadataService.updateOneField({
      updateFieldInput,
      workspaceId,
    });

    return {
      success: true,
      message: `Synced ${options.length} stage(s) successfully.`,
      options,
    };
  }

  private async fetchStagesFromWebhook(
    webhookUrl: string,
    workspaceId: string,
  ): Promise<WebhookStagesResponse> {
    try {
      const client = this.secureHttpClientService.getHttpClient(
        { timeout: WEBHOOK_TIMEOUT_MS },
        { workspaceId, source: 'stage-sync' },
      );

      const response = await client.get<WebhookStagesResponse>(webhookUrl);

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Stage sync webhook request failed: ${message}`);

      throw new StageSyncException(
        `Could not reach the stages webhook: ${message}`,
        StageSyncExceptionCode.WEBHOOK_REQUEST_FAILED,
      );
    }
  }

  private mapResponseOrThrow(rawResponse: WebhookStagesResponse) {
    try {
      return mapWebhookResponseToStageOptions(rawResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new StageSyncException(
        message,
        StageSyncExceptionCode.INVALID_WEBHOOK_RESPONSE,
      );
    }
  }
}
