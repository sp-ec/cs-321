import React from "react";
import "./JoinGroupPage.css";

function JoinGroupPage() {
	let username;

	// document.getElementById("submitNameButton").onClick = function () {
	//   username = document.getElementById("username").value;
	//   document.getElementById("welcome").textContent = username;
	// };

	return (
		<div>
			<div>
				<h1 id="myH1">Welcome</h1>

				<label>Name: </label>
				<input id="username"></input>
				<br />
				<button id="submitNameButton">submit</button>

				<br />
				<h3 id="groupMembers"> Group Members: </h3>
				<p id="welcome"></p>
			</div>

			<br />
			<div>
				<button id="goToCalendar" onClick="CalenderViewPage.jsx">
					Go To Calendar
				</button>
			</div>
		</div>
	);
}

export default JoinGroupPage;
