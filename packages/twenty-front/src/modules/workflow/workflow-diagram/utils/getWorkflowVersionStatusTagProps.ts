import { type WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type TagColor } from 'twenty-ui/data-display';

export const getWorkflowVersionStatusTagProps = ({
  workflowVersionStatus,
}: {
  workflowVersionStatus: WorkflowVersionStatus;
}): { color: TagColor; text: string } => {
  if (workflowVersionStatus === 'ARCHIVED') {
    return {
      color: 'gray',
      text: i18n._(msg`Archived`),
    };
  }

  if (workflowVersionStatus === 'DRAFT') {
    return {
      color: 'yellow',
      text: i18n._(msg`Draft`),
    };
  }

  if (workflowVersionStatus === 'ACTIVE') {
    return {
      color: 'green',
      text: i18n._(msg`Active`),
    };
  }

  return {
    color: 'gray',
    text: i18n._(msg`Deactivated`),
  };
};
