// MyCalendar.tsx
import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import CustomToolbar from './CustomToolbar';
import EventDetails from './EventDetails';
import { MyEvent } from './Events';
import { db } from '@services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CalendarStyles from './CalendarStyles';
import { generateICS } from '../../utils/icsUtils';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MyCalendar: React.FC = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        const eventsList = eventSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            start: data.start.toDate(),
            end: data.end.toDate(),
            allDay: data.allDay || false,
            location: data.location || 'Location not specified',
            notifications: data.notifications || {}
          } as MyEvent;
        });
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event: MyEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div style={CalendarStyles.pageContainer}>
      <header style={CalendarStyles.header}>
        <h1 style={CalendarStyles.headerText}>Events Calendar</h1>
      </header>
      <div style={CalendarStyles.container}>
        <div style={CalendarStyles.calendarContainer}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventClick}
            views={['month']}
            defaultView="month"
            components={{ toolbar: CustomToolbar }}
            toolbar={true}
            popup={false}
          />
          <div style={CalendarStyles.buttonContainer}>
            <button onClick={() => generateICS(events)} style={CalendarStyles.button}>
              Download Calendar
            </button>
          </div>
        </div>
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyCalendar;
