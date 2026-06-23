import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, getYear, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useState, useMemo } from 'react';

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
  margin-bottom: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTodayChip = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
    border-color: ${themeCssVariables.border.color.strong};
    color: ${themeCssVariables.font.color.primary};
  }

  &.active {
    background: ${themeCssVariables.accent.primary};
    border-color: ${themeCssVariables.accent.primary};
    color: ${themeCssVariables.font.color.inverted};
  }
`;

const StyledDateRangeContainer = styled.div`
  align-items: center;
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  height: 24px;
  min-width: 0;
  overflow: hidden;

  &:focus-within {
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledDateSegment = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledDateInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 90px;
  outline: none;
  padding: 0;

  &::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  &::-webkit-calendar-picker-indicator {
    display: none;
  }
`;

const StyledArrowSeparator = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  padding: 0 2px;
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
  font-size: 10px;
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
  const [isTodayActive, setIsTodayActive] = useState(false);

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords, refetch } =
    useCustomResolver<TimelineCalendarEventsWithTotal>(
      getTimelineCalendarEventsFromObjectRecord,
      'getTimelineCalendarEventsFromObjectRecord',
      'timelineCalendarEvents',
      targetRecord,
      TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
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

  const handleTodayClick = () => {
    if (isTodayActive) {
      setIsTodayActive(false);
      setStartDateFilter('');
      setEndDateFilter('');
    } else {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      setIsTodayActive(true);
      setStartDateFilter(todayStr);
      setEndDateFilter(todayStr);
    }
  };

  const handleStartChange = (value: string) => {
    setStartDateFilter(value);
    setIsTodayActive(false);
  };

  const handleEndChange = (value: string) => {
    setEndDateFilter(value);
    setIsTodayActive(false);
  };

  const handleClear = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setIsTodayActive(false);
  };

  const isFiltered = startDateFilter !== '' || endDateFilter !== '';

  const filteredEvents = useMemo(() => {
    if (!timelineCalendarEvents) return [];
    if (!isFiltered) return timelineCalendarEvents;

    return timelineCalendarEvents.filter((event) => {
      const eventDate = new Date(event.startsAt);
      if (startDateFilter) {
        const start = startOfDay(parseISO(startDateFilter));
        if (eventDate < start) return false;
      }
      if (endDateFilter) {
        const end = endOfDay(parseISO(endDateFilter));
        if (eventDate > end) return false;
      }
      return true;
    });
  }, [timelineCalendarEvents, startDateFilter, endDateFilter, isFiltered]);

  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(filteredEvents);

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

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    // TODO: change animated placeholder
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No Events`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`No events have been scheduled with this ${objectName} yet.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

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
            <StyledDateSegment>
              <StyledDateInput
                type="date"
                value={startDateFilter}
                onChange={(e) => handleStartChange(e.target.value)}
              />
            </StyledDateSegment>
            <StyledArrowSeparator>→</StyledArrowSeparator>
            <StyledDateSegment>
              <StyledDateInput
                type="date"
                value={endDateFilter}
                onChange={(e) => handleEndChange(e.target.value)}
              />
            </StyledDateSegment>
            {isFiltered && (
              <StyledClearButton onClick={handleClear} title={t`Clear`}>
                ✕
              </StyledClearButton>
            )}
          </StyledDateRangeContainer>
        </StyledFilterBar>
        {filteredEvents.length === 0 && isFiltered ? (
          <AnimatedPlaceholderEmptyContainer>
            <AnimatedPlaceholder type="noMatchRecord" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                {t`No Events`}
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                {t`No events match the selected date range.`}
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        ) : (
          monthTimes.map((monthTime) => {
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
                        {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                      </>
                    }
                  />
                </StyledTitleContainer>
                <CalendarMonthCard dayTimes={monthDayTimes} />
              </Section>
            );
          })
        )}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
