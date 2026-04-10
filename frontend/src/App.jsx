import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import CalendarViewPage from "./pages/CalendarViewPage";
import GroupMembersPage from "./pages/GroupMembersPage/GroupMembersPage.jsx";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<CreateGroupPage />} />
				<Route
					path="*"
					element={
						<>
							<div className="bg-zinc-900 h-14 w-full shadow-md border-b border-zinc-800 flex flex-row justify-between place-items-center p-4">
								<span className="text-xl">ezCalendar</span>
								<div className="flex flex-row gap-6 pr-4">
									<Link
										to="/calendar"
										className="text-sm text-zinc-300 hover:text-zinc-100"
									>
										Calendar
									</Link>
									<Link
										to="/members"
										className="text-sm text-zinc-300 hover:text-zinc-100"
									>
										Members
									</Link>
								</div>
							</div>
							<div className="p-4">
								<Routes>
									<Route path="/join" element={<JoinGroupPage />} />
									<Route path="/calendar" element={<CalendarViewPage />} />
									<Route path="/members" element={<GroupMembersPage />} />
								</Routes>
							</div>
						</>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
