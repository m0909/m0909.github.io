const NUMBER_OF_ROWS = 10;
var dataList = [];
var nameList = [];

var elementBeingMoved = { origin: 0, reference: null };
var globalRef = { pool: null, currentRow: null };


initialize();

function initialize() {
	var board;
	var row;
	var cell;
	var div;
	var seq;
	var codeList = [];
	var nameList = [];
	var count;
		
	board = document.getElementById("board");
	board.innerHTML = "<tbody><tr><th>Airline Name</th><th class=\"hidden\" id=\"answer\">Correct Code</th><th style=\"width: 100px;\">Code</th><td id=\"pool\" style=\"width: 100px;\"></td></tr></tbody>";
	
	globalRef.pool = document.getElementById("pool");

	board = board.firstElementChild;
	
	dataList = ["CX Cathay Pacific", "JL Japan Airlines", "AA American Airlines", "CA Air China", "SK SAS-Scandinavian", "EK Emirates", "KL KLM-Royal Dutch", "UA United Airlines", "LH Lufthansa", "SQ Singapore Airlines", "BA British Airways", "AF Air France", "TP TAP Portugal", "TK Turkish Airlines", "MH Malaysia Airlines", "NH All Nippon Airways", "AC Air Canada", "WN Southwest", "CZ China Eastern Airlines", "CI China Airlines", "BR EVA Air", "KE Korean Air", "OZ Asiana", "PR Philippine Airlines", "SU Aeroflot", "LX SWISS International", "DL Delta Airlines", "SA South Africa Airways", "TG Thai Aiways", "AY Finnair", "AZ Alitalia", "B6 JetBlue Airways", "FI Icelandair", "LY El Al Israel Airlines", "MU China Eastern Airlines", "VS Virgin Atlantic Airways"];
	
	for ( count = 0; count < NUMBER_OF_ROWS; count++ ) {
		seq = Math.floor(Math.random() * dataList.length)
		nameList.push(dataList[seq].substr(3));		//from the 4th character onwards
		codeList.push(dataList[seq].substr(0,2));	//first two characters
		dataList.splice(seq,1);  //remove the element
	}	
	
	for ( count = 0; count < NUMBER_OF_ROWS; count++ ) {
		row = document.createElement("tr");
		cell = document.createElement("td");
		cell.id = "name" + count;
		cell.textContent = nameList[count];
		row.appendChild(cell);
		
		cell = document.createElement("td");
		cell.classList.add("hidden");
		cell.id = "answer" + count;
		cell.textContent = codeList[count];
		row.appendChild(cell);
		
		cell = document.createElement("td");
		cell.id = "code" + count;
		cell.addEventListener("dragover", handleDragOver, false);
		cell.addEventListener("dragend", handleDragEnd, false);
		cell.addEventListener("dragleave", handleDragLeave, false);
		cell.addEventListener("drop", handleDrop, false);

		row.appendChild(cell);
		board.appendChild(row);
	}
	
	// randomize the codeList array
	for ( count = 0; count < 100; count++ ) {
		// remove from the end, and insert it back somewhere in the middle
		codeList.splice(Math.floor(Math.random() * NUMBER_OF_ROWS), 0, codeList.pop());
	}
	
	cell = globalRef.pool;
	
	for ( count = 0; count < NUMBER_OF_ROWS; count++ ) {
		div = document.createElement("div");
		div.classList.add("gamePiece");
		div.id = "piec" + count;
		div.setAttribute("draggable","true");
		div.textContent = codeList[count];
		div.addEventListener("dragstart", handleDragStart, false);
		div.addEventListener("dragend", handleDragEnd, false);
		cell.appendChild(div);
	}	
	
	cell.setAttribute("rowspan", NUMBER_OF_ROWS + 1);
	cell.addEventListener("dragenter", handleDragEnter, false);
	cell.addEventListener("dragover", handleDragOver, false);
	cell.addEventListener("drop", handleDrop, false);
}

function handleDragStart(e) {
	e.target.classList.add("draggedItem");
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text", "airlineGame");
	elementBeingMoved.reference = this;
	elementBeingMoved.origin = 0;
}

function handleDragOver(e) {

	var elemId;

	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	e.dataTransfer.dropEffect = "move";  
	elementBeingMoved.reference.style.visibility = "hidden";
	
	if ( elementBeingMoved.origin === 0 ) {
		// if we have not yet set the origin, set it here
		// the first dragover object tells us the origin
		if ( this.id === "pool" ) {
			elementBeingMoved.origin = 1;
		}
		else {
			if ( this.id.indexOf("code") !== -1 ) {
				elementBeingMoved.origin = 2;
			}
		}
	}
		
	elemId = "";
	
	if ( e.target.id.indexOf("code") !== -1 ) {
		elemId = e.target.id.substr(4);  //from the fourth character onwards
	}
	else {
		if ( e.target.id.indexOf("piec") !== -1 ) {
			elemId = e.target.parentNode.id.substr(4);   
			// if we get something, it will from the code node, which is what we want
		}
	}
	
	if ( elemId !== "" ) {
		// no need to do the following for pool
		globalRef.currentRow = document.getElementById("name" + elemId);
		globalRef.currentRow.classList.add("highlight");
	}
	
	return false;
}

function handleDragEnter(e) {
	
//	elementBeingMoved.reference.style.visibility = "hidden";
}

function handleDragLeave(e) {

	if ( globalRef.currentRow !== null ) {
		globalRef.currentRow.classList.remove("highlight");
		globalRef.currentRow = null;
	}
}

function handleDrop(e) {
	var child;
	
	
	if ( e.dataTransfer.getData("text") !== "airlineGame" ) {
		// only allow dropping if the object comes from the game
		return;
	}
	
	if ( this.id === "pool" ) {
		if ( elementBeingMoved.origin === 2 ) {
			// only need to return to the pool if the origin is from the answer grid
			returnToPool(elementBeingMoved.reference);
		}
	}
	else {
		child = this.firstElementChild;
		if ( child !== null ) {
			// if there is already a child, move the child back to the pool
			returnToPool(child);
		}
		this.appendChild(elementBeingMoved.reference);
	}	
	
	if ( globalRef.currentRow !== null ) {
		globalRef.currentRow.classList.remove("highlight");
		globalRef.currentRow = null;
	}
	
	// if after dropping we have no more pieces, show the "check my answers" button
	if ( globalRef.pool.hasChildNodes() === false ) {
		globalRef.pool.appendChild(createButton("Check my answers", "checkAnswer", "checkAnswers()"));
	}

	// finalize the actual move
	e.preventDefault();

}

function createButton(caption, id, clickEvent) {
	var child;
	child = document.createElement("button");
	if ( typeof(id) !== null && id !== "" ) {
		child.id = id;
	}
	child.textContent = caption;
	child.setAttribute("onclick", clickEvent);
	return child;
}		

function returnToPool(elem) {
	var child;
	
	// if we have the check answer button, remove it first
	if ( globalRef.pool.firstChild.id === "checkAnswer") {
		globalRef.pool.firstChild.remove();
	}
	
	globalRef.pool.appendChild(elem);
}

function checkAnswers() {
	var count;
	var elem;
	var actual;
	var correct = 0;
	
	for ( count = 0; count < NUMBER_OF_ROWS; count++ ) {
		elem = document.getElementById("piec" + count);
		elem.setAttribute("draggable","false");
	}
	
	elem = document.getElementById("answer");
	elem.classList.add("reveal");
	elem.classList.remove("hidden");
	
	for ( count = 0; count < NUMBER_OF_ROWS; count++ ) {
		elem = document.getElementById("answer" + count);
		elem.classList.add("reveal");
		elem.classList.remove("hidden");
		
		actual = document.getElementById("code" + count);
		actual.firstChild.classList.remove("gamePiece");  //remove the borders
		
		if ( actual.textContent === elem.textContent ) {
			actual.classList.add("correctAnswer");
			correct++;
		}
		else {
			actual.classList.add("incorrectAnswer");
		}
	}
	
	globalRef.pool.removeChild(document.getElementById("checkAnswer"));
	
	elem = document.createElement("div");
	elem.innerHTML = "<span style=\"font-size: 3em;\">" + correct + "</span>&nbsp;/" + NUMBER_OF_ROWS;
	globalRef.pool.appendChild(elem);
	
	globalRef.pool.appendChild(createButton("Play again", "", "initialize()"));
		
}

function handleDragEnd(e) {
	
	this.classList.remove("draggedItem");
	elementBeingMoved.reference.style.visibility = "visible";

}
