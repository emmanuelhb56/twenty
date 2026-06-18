import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useLingui } from '@lingui/react/macro';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useWorkflowNodeLabel = (
  data: WorkflowDiagramStepNodeData,
): string => {
  const { t } = useLingui();
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);

  const logicFunctionId =
    data.nodeType === 'action' ? data.logicFunctionId : undefined;

  const applicationId = isDefined(logicFunctionId)
    ? logicFunctions.find(
        (logicFunction) => logicFunction.id === logicFunctionId,
      )?.applicationId
    : undefined;

  const isThirdPartyApplication = useIsThirdPartyApplication(applicationId);

  const { applicationChipData } = useApplicationChipData({ applicationId });

  if (isThirdPartyApplication) {
    return applicationChipData.name;
  }

  return data.nodeType === 'trigger'
    ? t`Trigger`
    : data.nodeType === 'action'
      ? t`Action`
      : capitalize(data.nodeType);
};
