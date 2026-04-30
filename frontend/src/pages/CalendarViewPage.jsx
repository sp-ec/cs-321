import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarViewPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGroup, updateAvailability } from "../lib/api";
import {
  clearGroupSession,
  findSessionMember,
  getGroupSession,
} from "../lib/groupSession";

function CalendarViewPage() {
  const { groupId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [events, setEvents] = useState([]);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  useEffect(() => {
    const loadGroup = async () => {
      const session = getGroupSession(groupId);

      if (!session) {
        navigate(`/${groupId}/join`, {
          replace: true,
          state: { message: "Join or select your name to access this group." },
        });
        return;
      }

      try {
        const data = await fetchGroup(groupId);
        const user = findSessionMember(data, session);

        if (!user) {
          clearGroupSession(groupId);
          navigate(`/${groupId}/join`, {
            replace: true,
            state: { message: "Select your name again to continue." },
          });
          return;
        }

        setGroupData(data);
        setCurrentUser(user);
        setEvents(
          user.availabilities?.map((availability, index) => ({
            id: String(index),
            start: availability.start,
            end: availability.end,
          })) || [],
        );
      } catch {
        navigate("/");
      }
    };

    loadGroup();
  }, [groupId, navigate]);

  const syncEventsWithBackend = async (updatedEvents) => {
    if (!currentUser) {
      setErrorMessage("Sign back into the group before saving availability.");
      return false;
    }

    try {
      setErrorMessage("");
      await updateAvailability({
        groupId,
        actingUserId: currentUser.userId,
        userId: currentUser.userId,
        availabilities: updatedEvents.map((event) => ({
          start: event.start,
          end: event.end,
        })),
      });
      return true;
    } catch (error) {
      setErrorMessage(error.message || "Failed to save availability.");
      return false;
    }
  };

  const handleSelect = async (selectionInfo) => {
    const newBlock = {
      start: new Date(selectionInfo.startStr).getTime(),
      end: new Date(selectionInfo.endStr).getTime(),
    };

    const allBlocks = events.map((event) => ({
      start: new Date(event.start).getTime(),
      end: new Date(event.end).getTime(),
    }));

    allBlocks.push(newBlock);
    allBlocks.sort((a, b) => a.start - b.start);

    const mergedBlocks = [];
    let current = allBlocks[0];

    for (let i = 1; i < allBlocks.length; i++) {
      const next = allBlocks[i];
      if (current.end >= next.start) {
        current.end = Math.max(current.end, next.end);
      } else {
        mergedBlocks.push(current);
        current = next;
      }
    }

    mergedBlocks.push(current);

    const newEvents = mergedBlocks.map((block, index) => ({
      id: String(index),
      start: new Date(block.start).toISOString(),
      end: new Date(block.end).toISOString(),
    }));

    const previousEvents = events;
    setEvents(newEvents);
    selectionInfo.view.calendar.unselect();

    const didSync = await syncEventsWithBackend(newEvents);
    if (!didSync) {
      setEvents(previousEvents);
    }
  };

  const handleEventClick = async (clickInfo) => {
    if (!clickInfo.event.extendedProps.isCurrentUser) {
      return;
    }

    if (window.confirm("Remove this available time block?")) {
      const previousEvents = events;
      const updatedEvents = events.filter(
        (event) => event.id !== clickInfo.event.id,
      );
      setEvents(updatedEvents);
      const didSync = await syncEventsWithBackend(updatedEvents);
      if (!didSync) {
        setEvents(previousEvents);
      }
    }
  };

  const generateHeatmapEvents = () => {
    if (!groupData?.users) {
      return [];
    }

    const allIntervals = [];
    groupData.users.forEach((user) => {
      const userEvents =
        user.userId === currentUser?.userId ? events : user.availabilities || [];
      userEvents.forEach((event) => {
        allIntervals.push({
          start: new Date(event.start).getTime(),
          end: new Date(event.end).getTime(),
        });
      });
    });

    if (allIntervals.length === 0) {
      return [];
    }

    const timePoints = Array.from(
      new Set(allIntervals.flatMap((interval) => [interval.start, interval.end])),
    ).sort((a, b) => a - b);
    const totalUsers = groupData.users.length || 1;
    const heatmapSegments = [];

    for (let i = 0; i < timePoints.length - 1; i++) {
      const segStart = timePoints[i];
      const segEnd = timePoints[i + 1];
      let overlapCount = 0;

      for (const interval of allIntervals) {
        if (interval.start <= segStart && interval.end >= segEnd) {
          overlapCount++;
        }
      }

      if (overlapCount > 0) {
        heatmapSegments.push({
          start: segStart,
          end: segEnd,
          count: overlapCount,
        });
      }
    }

    const mergedSegments = [];
    if (heatmapSegments.length > 0) {
      let current = heatmapSegments[0];
      for (let i = 1; i < heatmapSegments.length; i++) {
        const next = heatmapSegments[i];
        if (current.end === next.start && current.count === next.count) {
          current.end = next.end;
        } else {
          mergedSegments.push(current);
          current = next;
        }
      }
      mergedSegments.push(current);
    }

    return mergedSegments.map((segment, index) => {
      const opacity = Math.max(0.15, segment.count / totalUsers);
      return {
        id: `heatmap-${index}`,
        start: new Date(segment.start).toISOString(),
        end: new Date(segment.end).toISOString(),
        title: `${segment.count}/${totalUsers}`,
        backgroundColor: `rgba(34, 197, 94, ${opacity})`,
        borderColor: "transparent",
        extendedProps: {
          isCurrentUser: false,
        },
      };
    });
  };

  const calendarEvents = heatmapMode
    ? generateHeatmapEvents()
    : groupData?.users.flatMap((user) => {
        const isCurrentUser = user.userId === currentUser?.userId;
        const sourceEvents = isCurrentUser ? events : user.availabilities || [];

        const bgOpacity = "80%";
        const borderOpacity = "100%";

        return sourceEvents.map((event, index) => ({
          id: isCurrentUser ? event.id : `${user.userId}-${index}`,
          start: event.start,
          end: event.end,
          title: user.userName,
          backgroundColor: `color-mix(in srgb, ${user.memberColor} ${bgOpacity}, transparent)`,
          borderColor: `color-mix(in srgb, ${user.memberColor} ${borderOpacity}, transparent)`,
          priority: isCurrentUser ? 1 : 2,
          extendedProps: {
            isCurrentUser,
          },
        }));
      }) || [];

  const renderEventContent = (eventInfo) => {
    if (heatmapMode) {
      return (
        <div className="flex items-center justify-center w-full h-full text-white font-bold drop-shadow-md">
          <span className="text-sm truncate">{eventInfo.event.title}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col overflow-hidden">
        <b className="text-xs truncate">{eventInfo.event.title}</b>
        <span className="text-xs truncate">{eventInfo.timeText}</span>
      </div>
    );
  };

  return (
    <div>
      <h1 className="calendar-group-title mt-8">
        {groupData?.groupName || "Group Loading..."}
      </h1>
      <p className="-mt-10 mb-6">{groupData?.groupDescription || ""}</p>
      <div className="calendar-members-row">
        {groupData?.users.map((user) => (
          <span
            key={user.userId}
            style={{
              backgroundColor: `color-mix(in srgb, ${user.memberColor} 60%, transparent)`,
              borderColor: `color-mix(in srgb, ${user.memberColor} 100%, transparent)`,
            }}
            className="text-white px-4 py-2 rounded-full text-sm border user-badge"
          >
            <span>{user.userName}</span>
          </span>
        ))}
      </div>

      {errorMessage ? <p className="calendar-error-message">{errorMessage}</p> : null}

      <div className="mb-4 flex items-center gap-4 flex-row justify-end">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <label className="flex items-center cursor-pointer gap-3 select-none">
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                heatmapMode ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                  heatmapMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <input
              type="checkbox"
              checked={heatmapMode}
              onChange={(e) => setHeatmapMode(e.target.checked)}
              className="hidden"
            />
            <span className="text-lg text-zinc-300">Heatmap Mode</span>
          </label>
        </div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-lg">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
          eventOrder="priority"
          initialView="timeGridWeek"
          contentHeight="auto"
          slotDuration="00:30:00"
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
          slotEventOverlap={true}
          unselectAuto={true}
          select={handleSelect}
          eventClick={handleEventClick}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventBackgroundColor={
            currentUser
              ? `color-mix(in srgb, ${currentUser.memberColor} 80%, transparent)`
              : "#22c55e"
          }
          eventBorderColor={
            currentUser
              ? `color-mix(in srgb, ${currentUser.memberColor} 100%, transparent)`
              : "#22c55e"
          }
        />
      </div>
    </div>
  );
}

export default CalendarViewPage;
