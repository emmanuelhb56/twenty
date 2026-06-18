import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const StageSyncExceptionCode = appendCommonExceptionCode({
  WEBHOOK_URL_NOT_CONFIGURED: 'WEBHOOK_URL_NOT_CONFIGURED',
  WEBHOOK_REQUEST_FAILED: 'WEBHOOK_REQUEST_FAILED',
  INVALID_WEBHOOK_RESPONSE: 'INVALID_WEBHOOK_RESPONSE',
  STAGE_FIELD_NOT_FOUND: 'STAGE_FIELD_NOT_FOUND',
} as const);

// oxlint-disable-next-line no-redeclare
export type StageSyncExceptionCode =
  (typeof StageSyncExceptionCode)[keyof typeof StageSyncExceptionCode];

const getStageSyncExceptionUserFriendlyMessage = (
  code: keyof typeof StageSyncExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case StageSyncExceptionCode.WEBHOOK_URL_NOT_CONFIGURED:
      return msg`STAGES_SYNC_WEBHOOK_URL is not configured on the server.`;
    case StageSyncExceptionCode.WEBHOOK_REQUEST_FAILED:
      return msg`Could not reach the stages webhook. Please try again later.`;
    case StageSyncExceptionCode.INVALID_WEBHOOK_RESPONSE:
      return msg`The stages webhook returned an unexpected response.`;
    case StageSyncExceptionCode.STAGE_FIELD_NOT_FOUND:
      return msg`The Opportunity "stage" field could not be found.`;
    case StageSyncExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class StageSyncException extends CustomException<
  keyof typeof StageSyncExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof StageSyncExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getStageSyncExceptionUserFriendlyMessage(code),
    });
  }
}
