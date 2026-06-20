import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { CargoSyncService } from 'src/engine/metadata-modules/cargo-sync/services/cargo-sync.service';

const PERSON_OBJECT_NAME_SINGULAR = 'person';
const CARGO_FIELD_NAME = 'jerarquia';
const CARGO_FIELD_LABEL = 'Cargo';
const JOB_TITLE_FIELD_NAME = 'jobTitle';

@Injectable()
export class CargoSyncBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CargoSyncBootstrapService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly cargoSyncService: CargoSyncService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const workspaces = await this.workspaceRepository.find();

      for (const workspace of workspaces) {
        await this.ensureFieldAndSync(workspace.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cargo bootstrap failed — ${message}`);
    }
  }

  private async ensureFieldAndSync(workspaceId: string): Promise<void> {
    try {
      await this.ensureJerarquiaFieldExists(workspaceId);
      await this.deactivateJobTitleField(workspaceId);
      await this.syncCargosOrWarn(workspaceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Workspace ${workspaceId}: cargo bootstrap failed — ${message}`);
    }
  }

  private async deactivateJobTitleField(workspaceId: string): Promise<void> {
    const jobTitleField = await this.fieldMetadataService.findOneWithinWorkspace(
      workspaceId,
      {
        where: {
          name: JOB_TITLE_FIELD_NAME,
          object: { nameSingular: PERSON_OBJECT_NAME_SINGULAR },
          isActive: true,
        },
        relations: { object: true },
      },
    );

    if (!isDefined(jobTitleField)) return;

    await this.fieldMetadataService.updateOneField({
      updateFieldInput: { id: jobTitleField.id, isActive: false },
      workspaceId,
    });

    this.logger.log(
      `Workspace ${workspaceId}: deactivated standard jobTitle field (replaced by jerarquia)`,
    );
  }

  private async ensureJerarquiaFieldExists(workspaceId: string): Promise<void> {
    const existing = await this.fieldMetadataService.findOneWithinWorkspace(
      workspaceId,
      {
        where: {
          name: CARGO_FIELD_NAME,
          object: { nameSingular: PERSON_OBJECT_NAME_SINGULAR },
        },
        relations: { object: true },
      },
    );

    if (isDefined(existing)) return;

    const personObject = await this.objectMetadataRepository.findOne({
      where: { nameSingular: PERSON_OBJECT_NAME_SINGULAR, workspaceId },
    });

    if (!isDefined(personObject)) {
      this.logger.warn(
        `Workspace ${workspaceId}: person object not found — cannot create jerarquia field`,
      );
      return;
    }

    await this.fieldMetadataService.createOneField({
      workspaceId,
      createFieldInput: {
        objectMetadataId: personObject.id,
        type: FieldMetadataType.SELECT,
        name: CARGO_FIELD_NAME,
        label: CARGO_FIELD_LABEL,
        isLabelSyncedWithName: false,
        options: [],
      },
    });

    this.logger.log(
      `Workspace ${workspaceId}: created jerarquia SELECT field on person`,
    );
  }

  private async syncCargosOrWarn(workspaceId: string): Promise<void> {
    const webhookUrl = this.twentyConfigService.get('CARGO_SYNC_WEBHOOK_URL');

    if (!isDefined(webhookUrl) || webhookUrl.trim() === '') {
      this.logger.warn(
        `Workspace ${workspaceId}: CARGO_SYNC_WEBHOOK_URL not configured — jerarquia field left empty`,
      );
      return;
    }

    const result = await this.cargoSyncService.syncCargosIfPlaceholder(workspaceId);

    if (isDefined(result)) {
      if (result.success && result.options.length === 0) {
        this.logger.warn(
          `Workspace ${workspaceId}: cargo webhook returned 0 options — jerarquia field left empty`,
        );
      } else {
        this.logger.log(`Workspace ${workspaceId}: ${result.message}`);
      }
    }
  }
}
