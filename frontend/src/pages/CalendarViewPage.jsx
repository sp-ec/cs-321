import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarViewPage.css";
import { MdCalendarViewWeek } from "react-icons/md";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";

function CalendarViewPage() {
  const { groupId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const userName = searchParams.get("userName");
  const [currentUser, setCurrentUser] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [isWeekView, setIsWeekView] = useState(true);

  const calendarRef = useRef(null);

  useEffect(() => {
    const checkGroupExists = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/groups/fetch?groupId=${groupId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          console.log("Group not found, redirecting to home page.");
          navigate("/");
          return;
        }

        try {
          const data = await response.json();
          setGroupData(data);

          const user = data.users.find((u) => u.userName === userName);
          setCurrentUser(user);

          const userAvailabilities =
            user?.availabilities?.map((a, index) => ({
              id: String(index),
              start: a.start,
              end: a.end,
            })) || [];

          setEvents(userAvailabilities);
        } catch (error) {
          console.error("Error parsing group data:", error);
        }
      } catch (error) {
        navigate("/");
      }
    };
    checkGroupExists();
  }, [groupId, navigate, userName]);

  const toggleView = () => {
    const calendarApi = calendarRef.current.getApi();
    const newView = isWeekView ? "dayGridMonth" : "timeGridWeek";
    calendarApi.changeView(newView);
    setIsWeekView(!isWeekView);
  };

  const syncEventsWithBackend = async (updatedEvents) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/user/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: groupId,
            userName: userName,
            availabilities: updatedEvents.map((e) => ({
              start: e.start,
              end: e.end,
            })),
          }),
        },
      );

      if (!response.ok) {
        console.error("Failed to sync events with the backend.");
      }
    } catch (error) {
      console.error("Error syncing events:", error);
    }
  };

  const handleSelect = async (selectionInfo) => {
    const newBlock = {
      start: new Date(selectionInfo.startStr).getTime(),
      end: new Date(selectionInfo.endStr).getTime(),
    };

    const allBlocks = events.map((e) => ({
      start: new Date(e.start).getTime(),
      end: new Date(e.end).getTime(),
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

    setEvents(newEvents);
    selectionInfo.view.calendar.unselect();

    await syncEventsWithBackend(newEvents);
  };

  const handleEventClick = async (clickInfo) => {
    if (!clickInfo.event.extendedProps.isCurrentUser) {
      return;
    }

    if (window.confirm("Remove this available time block?")) {
      const updatedEvents = events.filter(
        (event) => event.id !== clickInfo.event.id,
      );
      setEvents(updatedEvents);
      await syncEventsWithBackend(updatedEvents);
    }
  };

  const generateHeatmapEvents = () => {
    if (!groupData || !groupData.users) return [];

    const allIntervals = [];
    groupData.users.forEach((user) => {
      const userEvents =
        user.userName === userName ? events : user.availabilities || [];
      userEvents.forEach((e) => {
        allIntervals.push({
          start: new Date(e.start).getTime(),
          end: new Date(e.end).getTime(),
        });
      });
    });

    if (allIntervals.length === 0) return [];

    const timePoints = Array.from(
      new Set(allIntervals.flatMap((i) => [i.start, i.end])),
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

    return mergedSegments.map((seg, index) => {
      const opacity = Math.max(0.15, seg.count / totalUsers);
      return {
        id: `heatmap-${index}`,
        start: new Date(seg.start).toISOString(),
        end: new Date(seg.end).toISOString(),
        title: `${seg.count}/${totalUsers}`,
        backgroundColor: `rgba(34, 197, 94, ${opacity})`,
        borderColor: "transparent",
        extendedProps: {
          isCurrentUser: false,
          isHeatmap: true,
        },
      };
    });
  };

  const calendarEvents = heatmapMode
    ? generateHeatmapEvents()
    : groupData?.users.flatMap((user) => {
        const isCurrentUser = user.userName === userName;
        const sourceEvents = isCurrentUser ? events : user.availabilities || [];

        return sourceEvents.map((event, index) => ({
          id: isCurrentUser ? event.id : `${user.userId}-${index}`,
          start: event.start,
          end: event.end,
          title: user.userName,
          backgroundColor: `color-mix(in srgb, ${user.memberColor} 80%, transparent)`,
          borderColor: `color-mix(in srgb, ${user.memberColor} 100%, transparent)`,
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
    <>
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

          {/* <button
            onClick={toggleView}
            className="bg-zinc-900 text-zinc-300 px-6 py-6 rounded-lg hover:bg-zinc-800 transition-colors font-medium"
          >
            {isWeekView ? (
              <MdCalendarViewWeek size="36" />
            ) : (
              <MdOutlineCalendarMonth size="36" />
            )}
          </button> */}
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
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
    </>
  );
}

export default CalendarViewPage;
