import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const DELAY_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'DELAY'>;
  icon: string;
} = {
  defaultLabel: 'Retraso',
  type: 'DELAY',
  icon: 'IconPlayerPause',
};
