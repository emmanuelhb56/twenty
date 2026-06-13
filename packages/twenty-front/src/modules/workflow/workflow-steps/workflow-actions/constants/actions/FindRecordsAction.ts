import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const FIND_RECORDS_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'FIND_RECORDS'>;
  icon: string;
} = {
  defaultLabel: 'Buscar registros',
  type: 'FIND_RECORDS',
  icon: 'IconSearch',
};
