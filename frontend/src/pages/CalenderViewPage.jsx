import { React, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function CalenderViewPage() {
  const [events, setEvents] = useState([]);

  const handleSelect = (selectionInfo) => {
    const newEvent = {
      id: String(Date.now()),
      start: selectionInfo.startStr,
      end: selectionInfo.endStr,
      allDay: selectionInfo.allDay,
      backgroundColor: "#3b82f6",
    };

    setEvents([...events, newEvent]);

    const calendarApi = selectionInfo.view.calendar;
    calendarApi.unselect();
  };

  return (
    <div>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotDuration="00:15:00"
        slotLabelInterval="00:60:00"
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: "short",
        }}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        unselectAuto={true}
        select={handleSelect}
        events={events}
      />
    </div>
  );
}

export default CalenderViewPage;
