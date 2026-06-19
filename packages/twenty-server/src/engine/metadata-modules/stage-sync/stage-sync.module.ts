import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { StageSyncBootstrapService } from 'src/engine/metadata-modules/stage-sync/services/stage-sync-bootstrap.service';
import { StageSyncResolver } from 'src/engine/metadata-modules/stage-sync/resolvers/stage-sync.resolver';
import { StageSyncService } from 'src/engine/metadata-modules/stage-sync/services/stage-sync.service';

// TwentyConfigModule es @Global, por eso no se importa aquí.
// PermissionsModule provee PermissionsService, requerido por el
// SettingsPermissionGuard(DATA_MODEL) del resolver.
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    SecureHttpClientModule,
    FieldMetadataModule,
    PermissionsModule,
  ],
  providers: [StageSyncService, StageSyncResolver, StageSyncBootstrapService],
  exports: [StageSyncService],
})
export class StageSyncModule {}
