import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarViewPage.css";
import { MdCalendarViewWeek } from "react-icons/md";
import { MdOutlineCalendarMonth } from "react-icons/md";

function CalendarViewPage() {
	const [events, setEvents] = useState([]);
	const [heatmapMode, setHeatmapMode] = useState(false);
	const [isWeekView, setIsWeekView] = useState(true);

	/*Mock people array. Need to remove later*/
	const members = [
		{ id: 1, name: "Harry Potter", badgeClass: "member-badge-owner" },
		{ id: 2, name: "Hermione Granger", badgeClass: "member-badge-admin" },
		{ id: 3, name: "Ron Weasley", badgeClass: "member-badge-member" },
	];

	const calendarRef = useRef(null);

	const toggleView = () => {
		const calendarApi = calendarRef.current.getApi();
		const newView = isWeekView ? "dayGridMonth" : "timeGridWeek";
		calendarApi.changeView(newView);
		setIsWeekView(!isWeekView);
	};

	const handleSelect = (selectionInfo) => {
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
	};

	const handleEventClick = (clickInfo) => {
		if (window.confirm("Remove this unavailable time block?")) {
			setEvents((prevEvents) =>
				prevEvents.filter((event) => event.id !== clickInfo.event.id),
			);
		}
	};

	const calendarEvents = events.map((event) => ({
		...event,
		backgroundColor: heatmapMode ? "rgba(34, 197, 94, 0.5)" : "#3b82f6",
		borderColor: heatmapMode ? "transparent" : "#3b82f6",
	}));

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
			<h1 className="calendar-group-title">
				Gryffindor Study Circle
			</h1>
			<div className="calendar-members-row">
				{members.map((member) => (
					<span
						key={member.id}
						className={`calendar-member-badge ${member.badgeClass}`}
					>
						{member.name}
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

				<button
					onClick={toggleView}
					className="bg-zinc-900 text-zinc-300 px-6 py-6 rounded-lg hover:bg-zinc-800 transition-colors font-medium"
				>
					{isWeekView ? (
						<MdCalendarViewWeek size="36" />
					) : (
						<MdOutlineCalendarMonth size="36" />
					)}
				</button>
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
				/>
			</div>
		</div>
	);
}

export default CalendarViewPage;
