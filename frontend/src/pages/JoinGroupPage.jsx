/*import React from 'react'

function JoinGroupPage() {
  return (
    <div>Join Group Page</div>
  )
}

export default JoinGroupPage*/

let username;

document.getElementById("submitNameButton").onclick = function(){
	username = document.getElementById("username").value;
	document.getElementById("welcome").textContent = username;
}

