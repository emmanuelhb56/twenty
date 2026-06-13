import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const UPSERT_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'UPSERT_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Crear o actualizar registro',
  type: 'UPSERT_RECORD',
  icon: 'IconPencilPlus',
};
