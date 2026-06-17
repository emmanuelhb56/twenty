import { useLingui } from '@lingui/react/macro';

export const useServerCommandMenuItemLabel = (): ((
  label: string,
) => string) => {
  const { t } = useLingui();

  return (label: string): string => {
    switch (label) {
      case 'Accounts':
        return t`Accounts`;
      case 'Activate':
        return t`Activate`;
      case 'Add a Node':
        return t`Add a Node`;
      case 'Admin Panel':
        return t`Admin Panel`;
      case 'AI':
        return t`AI`;
      case 'APIs & Webhooks':
        return t`APIs & Webhooks`;
      case 'Apps':
        return t`Apps`;
      case 'Ask AI':
        return t`Ask AI`;
      case 'Billing':
        return t`Billing`;
      case 'Calendars':
        return t`Calendars`;
      case 'Campaign':
        return t`Campaign`;
      case 'Cancel':
        return t`Cancel`;
      case 'Community':
        return t`Community`;
      case 'Compose':
        return t`Compose`;
      case 'Create View':
        return t`Create View`;
      case 'Data Model':
        return t`Data Model`;
      case 'Deactivate':
        return t`Deactivate`;
      case 'Delete':
        return t`Delete`;
      case 'Destroy':
        return t`Destroy`;
      case 'Discard Draft':
        return t`Discard Draft`;
      case 'Domains':
        return t`Domains`;
      case 'Duplicate':
        return t`Duplicate`;
      case 'Edit':
        return t`Edit`;
      case 'Edit Layout':
        return t`Edit Layout`;
      case 'Emails':
        return t`Emails`;
      case 'Experience':
        return t`Experience`;
      case 'Export':
        return t`Export`;
      case 'General':
        return t`General`;
      case 'Hide deleted':
        return t`Hide deleted`;
      case 'Import':
        return t`Import`;
      case 'Members':
        return t`Members`;
      case 'Merge':
        return t`Merge`;
      case 'Previous AI Chats':
        return t`Previous AI Chats`;
      case 'Reply':
        return t`Reply`;
      case 'Restore':
        return t`Restore`;
      case 'Retry':
        return t`Retry`;
      case 'Roles':
        return t`Roles`;
      case 'Save':
        return t`Save`;
      case 'Search':
        return t`Search`;
      case 'Security':
        return t`Security`;
      case 'See Active Version':
        return t`See Active Version`;
      case 'See Runs':
        return t`See Runs`;
      case 'See Version':
        return t`See Version`;
      case 'See Versions':
        return t`See Versions`;
      case 'See Workflow':
        return t`See Workflow`;
      case 'Send Email':
        return t`Send Email`;
      case 'Settings':
        return t`Settings`;
      case 'Stop':
        return t`Stop`;
      case 'Test':
        return t`Test`;
      case 'Tidy up':
        return t`Tidy up`;
      case 'Update':
        return t`Update`;
      case 'Use as Draft':
        return t`Use as Draft`;
      default:
        return label;
    }
  };
};
