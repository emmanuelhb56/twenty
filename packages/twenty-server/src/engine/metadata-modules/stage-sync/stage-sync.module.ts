import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { StageSyncResolver } from 'src/engine/metadata-modules/stage-sync/resolvers/stage-sync.resolver';
import { StageSyncService } from 'src/engine/metadata-modules/stage-sync/services/stage-sync.service';

// TwentyConfigModule es @Global, por eso no se importa aquí.
// PermissionsModule provee PermissionsService, requerido por el
// SettingsPermissionGuard(DATA_MODEL) del resolver.
@Module({
  imports: [SecureHttpClientModule, FieldMetadataModule, PermissionsModule],
  providers: [StageSyncService, StageSyncResolver],
  exports: [StageSyncService],
})
export class StageSyncModule {}
