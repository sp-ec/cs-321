import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import GroupMembers from "./GroupMembers/GroupMembers";

function CalenderViewPage() {
	const [events, setEvents] = useState([]);
	const [heatmapMode, setHeatmapMode] = useState(false);

	const handleSelect = (selectionInfo) => {
		const newBlock = {
			start: new Date(selectionInfo.startStr).getTime(),
			end: new Date(selectionInfo.endStr).getTime(),
		};

		// convert existing events into easily comparable timestamp blocks
		const allBlocks = events.map((e) => ({
			start: new Date(e.start).getTime(),
			end: new Date(e.end).getTime(),
		}));

		allBlocks.push(newBlock);

		// sort blocks by start time
		allBlocks.sort((a, b) => a.start - b.start);

		// merge overlapping or immediately adjacent blocks
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

		// format back into FullCalendar event objects
		const newEvents = mergedBlocks.map((block, index) => ({
			id: String(index),
			start: new Date(block.start).toISOString(),
			end: new Date(block.end).toISOString(),
		}));

		setEvents(newEvents);
		selectionInfo.view.calendar.unselect();
	};

	const handleEventClick = (clickInfo) => {
		if (window.confirm("Remove this unavailable time block?")) {
			setEvents((prevEvents) =>
				prevEvents.filter((event) => event.id !== clickInfo.event.id),
			);
		}
	};

	// apply the heatmap styling dynamically
	const calendarEvents = events.map((event) => ({
		...event,
		backgroundColor: heatmapMode ? "rgba(34, 197, 94, 0.5)" : "#3b82f6", // green alpha vs solid blue
		borderColor: heatmapMode ? "transparent" : "#3b82f6",
	}));

	// hide the time text inside the blocks when in heatmap mode
	const renderEventContent = (eventInfo) => {
		if (heatmapMode) {
			return <div style={{ width: "100%", height: "100%" }}></div>;
		}
		return (
			<>
				<b>{eventInfo.timeText}</b>
			</>
		);
	};

	return (
		<div>
			<GroupMembers />

			<div
				style={{
					marginBottom: "10px",
					display: "flex",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<label
					style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
				>
					<input
						type="checkbox"
						checked={heatmapMode}
						onChange={(e) => setHeatmapMode(e.target.checked)}
						style={{ marginRight: "8px" }}
					/>
					Heatmap Mode
				</label>
			</div>

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
				eventClick={handleEventClick}
				events={calendarEvents}
				eventContent={renderEventContent}
			/>
		</div>
	);
}

export default CalenderViewPage;
