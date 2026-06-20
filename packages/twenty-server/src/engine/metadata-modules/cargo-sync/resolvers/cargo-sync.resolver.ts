import { UseGuards } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CargoSyncService } from 'src/engine/metadata-modules/cargo-sync/services/cargo-sync.service';
import { SyncCargosResultDTO } from 'src/engine/metadata-modules/cargo-sync/dtos/sync-cargos-result.dto';
import { cargoSyncGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/cargo-sync/utils/cargo-sync-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver()
export class CargoSyncResolver {
  constructor(private readonly cargoSyncService: CargoSyncService) {}

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => SyncCargosResultDTO)
  async syncPersonCargos(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SyncCargosResultDTO> {
    try {
      return await this.cargoSyncService.syncCargos(workspaceId);
    } catch (error) {
      return cargoSyncGraphqlApiExceptionHandler(error as Error);
    }
  }
}
