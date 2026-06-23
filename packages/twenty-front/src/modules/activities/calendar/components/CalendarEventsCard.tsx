import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, getYear } from 'date-fns';
import { useState } from 'react';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useSubscribeTimelineToParticipantChanges } from '@/activities/hooks/useSubscribeTimelineToParticipantChanges';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { H3Title } from 'twenty-ui/typography';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type TimelineCalendarEventsWithTotal } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  overflow: scroll;
  padding: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledFilterBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTodayChip = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
    border-color: ${themeCssVariables.border.color.strong};
    color: ${themeCssVariables.font.color.primary};
  }

  &.active {
    background: ${themeCssVariables.accent.quaternary};
    border-color: ${themeCssVariables.accent.tertiary};
    color: ${themeCssVariables.accent.primary};
  }
`;

const StyledDateRangeContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[2]};

  &:focus-within {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledDateLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const StyledDateInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  outline: none;
  width: 100px;

  &::-webkit-datetime-edit-text {
    color: ${themeCssVariables.font.color.tertiary};
  }
  &::-webkit-datetime-edit-month-field,
  &::-webkit-datetime-edit-day-field,
  &::-webkit-datetime-edit-year-field {
    border-radius: 2px;
    &:focus {
      background: ${themeCssVariables.accent.quaternary};
      color: ${themeCssVariables.accent.primary};
    }
  }
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.4;
    &:hover {
      opacity: 0.8;
    }
  }
`;

const StyledDateDivider = styled.div`
  background: ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  height: 12px;
  width: 1px;
`;

const StyledClearButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  margin-left: auto;
  padding: 0;
  width: 16px;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const CalendarEventsCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isTodayActive =
    startDateFilter === todayStr && endDateFilter === todayStr;

  const handleTodayClick = () => {
    if (isTodayActive) {
      setStartDateFilter('');
      setEndDateFilter('');
    } else {
      setStartDateFilter(todayStr);
      setEndDateFilter(todayStr);
    }
  };

  const handleClear = () => {
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const isFiltered = startDateFilter !== '' || endDateFilter !== '';

  const extraVariables = isFiltered
    ? {
        startDateFilter: startDateFilter
          ? new Date(startDateFilter + 'T00:00:00').toISOString()
          : undefined,
        endDateFilter: endDateFilter
          ? new Date(endDateFilter + 'T23:59:59').toISOString()
          : undefined,
      }
    : undefined;

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords, refetch } =
    useCustomResolver<TimelineCalendarEventsWithTotal>(
      getTimelineCalendarEventsFromObjectRecord,
      'getTimelineCalendarEventsFromObjectRecord',
      'timelineCalendarEvents',
      targetRecord,
      TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
      extraVariables,
    );

  useSubscribeTimelineToParticipantChanges({
    queryId: `calendar-${targetRecord.id}`,
    participantObjectNameSingular: 'calendarEventParticipant',
    relatedPersonIds:
      data?.getTimelineCalendarEventsFromObjectRecord?.relatedPersonIds ?? [],
    refetch,
  });

  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.getTimelineCalendarEventsFromObjectRecord ?? {};

  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(timelineCalendarEvents || []);

  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

  const objectName = targetRecord.targetObjectNameSingular;

  return (
    <CalendarContext.Provider
      value={{
        calendarEventsByDayTime,
      }}
    >
      <StyledContainer>
        <StyledFilterBar>
          <StyledTodayChip
            className={isTodayActive ? 'active' : ''}
            onClick={handleTodayClick}
          >
            {t`Today`}
          </StyledTodayChip>
          <StyledDateRangeContainer>
            <StyledDateLabel>{t`From`}</StyledDateLabel>
            <StyledDateInput
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
            <StyledDateDivider />
            <StyledDateLabel>{t`To`}</StyledDateLabel>
            <StyledDateInput
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
            {isFiltered && (
              <StyledClearButton onClick={handleClear} title={t`Clear`}>
                ✕
              </StyledClearButton>
            )}
          </StyledDateRangeContainer>
        </StyledFilterBar>

        {firstQueryLoading ? (
          <SkeletonLoader />
        ) : !timelineCalendarEvents?.length ? (
          <AnimatedPlaceholderEmptyContainer
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
          >
            <AnimatedPlaceholder type="noMatchRecord" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                {t`No Events`}
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                {isFiltered
                  ? t`No events found for the selected date range.`
                  : t`No events have been scheduled with this ${objectName} yet.`}
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        ) : (
          <>
            {monthTimes.map((monthTime) => {
              const monthDayTimes = daysByMonthTime[monthTime] || [];
              const year = getYear(monthTime);
              const lastMonthTimeOfYear = monthTimesByYear[year]?.[0];
              const isLastMonthOfYear = lastMonthTimeOfYear === monthTime;
              const monthLabel = format(monthTime, 'MMMM', {
                locale: localeCatalog,
              });

              return (
                <Section key={monthTime}>
                  <StyledTitleContainer>
                    <H3Title
                      title={
                        <>
                          {monthLabel}
                          {isLastMonthOfYear && (
                            <StyledYear> {year}</StyledYear>
                          )}
                        </>
                      }
                    />
                  </StyledTitleContainer>
                  <CalendarMonthCard dayTimes={monthDayTimes} />
                </Section>
              );
            })}
            <CustomResolverFetchMoreLoader
              loading={isFetchingMore || firstQueryLoading}
              onLastRowVisible={handleLastRowVisible}
            />
          </>
        )}
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
