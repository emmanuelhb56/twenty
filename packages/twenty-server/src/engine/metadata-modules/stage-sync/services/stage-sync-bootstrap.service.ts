import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StageSyncService } from 'src/engine/metadata-modules/stage-sync/services/stage-sync.service';

// Al arrancar, si STAGES_SYNC_WEBHOOK_URL está configurado y el workspace aún
// tiene las etapas de ejemplo de Twenty, las reemplaza con el catálogo del ERP.
@Injectable()
export class StageSyncBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StageSyncBootstrapService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly stageSyncService: StageSyncService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const webhookUrl = this.twentyConfigService.get('STAGES_SYNC_WEBHOOK_URL');

    if (!webhookUrl || webhookUrl.trim() === '') {
      return;
    }

    try {
      const workspaces = await this.workspaceRepository.find();

      for (const workspace of workspaces) {
        await this.syncWorkspaceIfDefaulted(workspace.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Stage sync bootstrap failed — ${message}`);
    }
  }

  private async syncWorkspaceIfDefaulted(workspaceId: string): Promise<void> {
    try {
      const result =
        await this.stageSyncService.syncOpportunityStagesIfDefaulted(
          workspaceId,
        );

      if (result) {
        this.logger.log(`Workspace ${workspaceId}: ${result.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Workspace ${workspaceId}: auto-sync stages failed — ${message}. ` +
          `Run manually from Settings → Modelo de datos → Opportunity → Etapa.`,
      );
    }
  }
}
