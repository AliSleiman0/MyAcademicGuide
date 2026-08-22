import React, { forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventInput } from '@fullcalendar/core';

export interface CalendarEvent {
    title: string;
    professor?: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    color?: string;
}

interface AcademicCalendarProps {
    events: CalendarEvent[];
    mobileOnly?: boolean;
    key?: string;
}

const AcademicCalendar = forwardRef<HTMLDivElement, AcademicCalendarProps>(
    ({ events, mobileOnly = false }, ref) => {
    const getEventBackground = (event: EventInput) => {
        // Use provided color if available, otherwise use default gradient
        return event.color || 'linear-gradient(150deg, #038b94 0%, #036956 100%)';
    };

    return (
        <div style={{
            borderLeft: "4px solid #038b94",
            borderRadius: "5px",

            ...(mobileOnly && { width: 'fit-content' })

        }}
            ref={ref}>

            <FullCalendar
                plugins={[timeGridPlugin]}
                stickyHeaderDates={false}
                initialView="timeGridWeek"
                headerToolbar={false}
                allDaySlot={false}
                height="auto"
                slotDuration="01:30:00"
                slotLabelInterval="01:30:00"
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }}
                events={(fetchInfo, successCallback) => {
                    const processedEvents: EventInput[] = events.map(event => ({
                        ...event,
                        color: event.color,
                        borderColor: "black",
                        extendedProps: {
                            professor: event.professor
                        },
                        startRecur: fetchInfo.startStr,
                        endRecur: fetchInfo.endStr
                    }));
                    successCallback(processedEvents);
                }}
                dayHeaderFormat={{ weekday: 'short' }}
                weekends={false}
                editable={false}
                selectable={false}

                eventDidMount={(info) => {
                    info.el.style.borderColor = 'black';
                    // Convert EventImpl to EventInput
                    const eventInput: EventInput = {
                        title: info.event.title,
                        start: info.event.start?.toISOString(),
                        end: info.event.end?.toISOString(),
                        color: info.event.backgroundColor,
                        borderColor: "black",
                        extendedProps: info.event.extendedProps
                    };

                    // Apply the background
                    info.el.style.background = getEventBackground(eventInput);
                    info.el.style.borderColor = getEventBackground(eventInput);
                    // Keep existing hover effects
                    info.el.style.transition = 'all 0.3s ease';
                    info.el.addEventListener('mouseenter', () => {
                        info.el.style.filter = 'brightness(110%)';
                        info.el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                    });
                    info.el.addEventListener('mouseleave', () => {
                        info.el.style.filter = 'brightness(100%)';
                        info.el.style.boxShadow = 'none';
                    });
                }}
                eventContent={(arg) => (
                    <div style={{
                        padding: '2px',
                        fontSize: mobileOnly ? '9px' : '14px',
                        width: 'fit-content',
                        height: mobileOnly ? '3rem' : '6rem',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        display: 'flex',
                        flexDirection: 'column',
                        color: "black",
                        lineHeight: '1.3'
                    }}>
                        <div><strong>{arg.event.title}</strong></div>
                        <div style={{ fontSize: '0.8em' }}>
                            {arg.event.extendedProps.professor}
                        </div>
                    </div>
                )}
                dayHeaderContent={(arg) => (
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        padding: '16px 0',
                        textAlign: 'center'
                    }}>
                        {arg.text}
                    </div>
                )}
                slotLabelContent={(arg) => (
                    <div style={{
                        padding: mobileOnly ? '2px' : '8px',
                        fontSize: mobileOnly ? '9px' : '14px',
                        height: mobileOnly ? '3rem' : '6rem',
                        wordBreak: 'break-word',
                        lineHeight: '1.2',
                    }}>
                        {arg.text}
                    </div>
                )}
            />
        </div>
        );
    }
);


export default AcademicCalendar;