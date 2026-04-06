import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateGroupPage from "./pages/CreateGroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import CalenderViewPage from "./pages/CalenderViewPage";
import GroupMembers from "./pages/GroupMembers/GroupMembers.jsx";

function App() {
	return (
		<>
			<div className="bg-zinc-900 h-16 w-full shadow-md border-b border-zinc-800 flex flex-row justify-start place-items-center p-4">
				<span className="text-2xl">Calendar App</span>
			</div>
			<div className="p-4">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<CreateGroupPage />} />
						<Route path="/join" element={<JoinGroupPage />} />
						<Route path="/calendar" element={<CalenderViewPage />} />
						<Route path="/members" element={<GroupMembers />} />
					</Routes>
				</BrowserRouter>
			</div>
		</>
	);
}

export default App;
