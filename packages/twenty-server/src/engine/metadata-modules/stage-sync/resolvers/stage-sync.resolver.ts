import { UseGuards } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SyncStagesResultDTO } from 'src/engine/metadata-modules/stage-sync/dtos/sync-stages-result.dto';
import { StageSyncService } from 'src/engine/metadata-modules/stage-sync/services/stage-sync.service';
import { stageSyncGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/stage-sync/utils/stage-sync-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver()
export class StageSyncResolver {
  constructor(private readonly stageSyncService: StageSyncService) {}

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => SyncStagesResultDTO)
  async syncOpportunityStages(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SyncStagesResultDTO> {
    try {
      return await this.stageSyncService.syncOpportunityStages(workspaceId);
    } catch (error) {
      return stageSyncGraphqlApiExceptionHandler(error as Error);
    }
  }
}
