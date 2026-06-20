import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { CargoSyncBootstrapService } from 'src/engine/metadata-modules/cargo-sync/services/cargo-sync-bootstrap.service';
import { CargoSyncResolver } from 'src/engine/metadata-modules/cargo-sync/resolvers/cargo-sync.resolver';
import { CargoSyncService } from 'src/engine/metadata-modules/cargo-sync/services/cargo-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, ObjectMetadataEntity]),
    SecureHttpClientModule,
    FieldMetadataModule,
    PermissionsModule,
  ],
  providers: [CargoSyncService, CargoSyncResolver, CargoSyncBootstrapService],
  exports: [CargoSyncService],
})
export class CargoSyncModule {}
