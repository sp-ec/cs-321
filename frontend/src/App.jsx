import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage.jsx";
import CalendarViewPage from "./pages/CalendarViewPage";
import GroupMembersPage from "./pages/GroupMembersPage/GroupMembersPage.jsx";
import Navbar from "./Navbar.jsx";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<CreateGroupPage />} />

				<Route
					path="/:groupId/*"
					element={
						<>
							<Navbar />
							<div className="p-4">
								<Routes>
									<Route path="join" element={<JoinGroupPage />} />
									<Route path="calendar" element={<CalendarViewPage />} />
									<Route path="members" element={<GroupMembersPage />} />
									<Route path="*" element={<Navigate to="/" replace />} />
								</Routes>
							</div>
						</>
					}
				/>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
