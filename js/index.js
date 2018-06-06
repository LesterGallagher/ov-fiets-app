var station_abrevs;
var selected_station;
var station_data;
var cordova_ready = false;

var isOnline = function () {
	RequestAPIData();
}, isOffline = function () {
	ons.notification.alert({
		message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd.',
	});
};

ons.disableAutoStatusBarFill();

if (window.addEventListener) {
	/*
		Works well in Firefox and Opera with the 
		Work Offline option in the File menu.
		Pulling the ethernet cable doesn't seem to trigger it.
		Later Google Chrome and Safari seem to trigger it well
	*/
	window.addEventListener("online", isOnline, false);
	window.addEventListener("offline", isOffline, false);
}
else {
	/*
		Works in IE with the Work Offline option in the 
		File menu and pulling the ethernet cable
	*/
	document.body.ononline = isOnline;
	document.body.onoffline = isOffline;
}

document.addEventListener("resume", function () {
	if (navigator.onLine === false) {
		ons.notification.alert({
			message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd.',
		});
	}
}, false)

document.addEventListener("deviceready", function () {
	cordova_ready = true;
	if (cordova.platformId === 'browser') {
		document.body.appendChild(document.createElement('script')).src = './js/browser.js';
	} else {
		document.body.appendChild(document.createElement('script')).src = './js/admob.js';
	}
	if (navigator.onLine === false) {
		ons.notification.alert({
			message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd.n',
		});
	}
}, false);

//Setup Goo Button for viewing of a particular station.
document.addEventListener('init', function (event) {
	var page = event.target;
	//console.log("button pressed");

	if (page.id === 'main-page') {
		page.querySelector('#go-button').addEventListener('click', function () {
			var input = document.getElementById("inputStation").value;
			if (Object.keys(station_abrevs).includes(input) === false) {
				ons.notification.alert({
					message: 'Locatie bestaat niet.',
				});
				return;
			}
			document.querySelector('#Navigator').pushPage('fietsen.html', { data: { title: selected_station + " OV Fietsen" }, callback: setupSecondaryPage });
		});
		var station_input = document.getElementById("inputStation");
		station_input.oninput = onStationInput;
		//console.log(station_input);


	} else if (page.id === 'secondary-page') {
		page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
		var pullHook = document.getElementById('pull-hook');

		pullHook.removeEventListener('changestate', pullHookChangeStateEventHandler);//remove previous event handlers.
		pullHook.addEventListener('changestate', pullHookChangeStateEventHandler);

		pullHook.onAction = function (done) {
			setTimeout(done, 1000);
		};
		//var openCloseTimesContainer = document.getElementById("openCloseTimesContainer");
		//console.log(openCloseTimesContainer)

		var abrev = station_abrevs[selected_station];
		window.currstation = station_data[abrev];

		window.pageReady = true;
		preparingMap();


		//while(openCloseTimesContainer.firstChild)
		//	openCloseTimesContainer.removeChild(openCloseTimesContainer.firstChild);

		//window.create(document.getElementById("openCloseTimesContainer"),currstation.openingHours,new Date().getHours() +":"+ new Date().getMinutes());

		// create map:

	}

});

function preparingMap() {
	if (!window.mapsReady || !window.pageReady)
		return;
	//else if everithing is ready:

	window.pageReady = false; // make sure the next time the page is loaded,
	// it isnt already set to true.

	var loc = { lat: currstation.lat, lng: currstation.lng };
	var map;
	map = new google.maps.Map(document.getElementById('stationMap'), {
		center: loc,
		zoom: 14,
		streetViewControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var contentString =
		'<div id="content">' +
		'<h4 id="firstHeading" class="firstHeading">' + currstation.description + '</h4>' +
		'<img id="locationImage" src="https://places.ns-mlab.nl/' + currstation.thumbnail.uri + '">' +
		'</div>';

	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	var marker = new google.maps.Marker({
		position: loc,
		map: map
	});
	marker.addListener('click', function () {
		infowindow.open(map, marker);
	});
}

function googleMapsReady() {
	window.mapsReady = true;
	preparingMap();
}

function pullHookChangeStateEventHandler(event) {
	var pullhook = event.srcElement;
	var message = '';

	switch (event.state) {
		case 'initial':
			message = 'Pull to refresh';
			break;
		case 'preaction':
			message = 'Release';
			break;
		case 'action':
			message = 'Loading...';
			break;
	}
	RequestAPIData(setupSecondaryPage);//callback "setupSecondaryPage()" to reinitiziate page.
	pullhook.querySelector("#refreshInfo").innerHTML = message;
}



//Load data

function RequestAPIData(callback) {

	httpGetJSONRequest("http://fiets.openov.nl/locaties.json", function (data) {
		//console.log(data);
		station_data = data.locaties;
		station_abrevs = {};
		for (var key in station_data) {
			if (station_data.hasOwnProperty(key)) {
				var val = station_data[key];
				station_abrevs[val.description] = key;
			}
		}
		if (callback) callback(data);
		onStationInput({ "srcElement": document.getElementById("inputStation") });
	}, "Something went wrong while connecting to an external server.");//Error message when something goes wrong
}

RequestAPIData();
setInterval(RequestAPIData, 10 * 60 * 1000 /*10 min*/)

function onStationInput(event, length = 8) {

	var suggestionList = document.getElementById("suggestionList");

	var inputElement = event.srcElement;
	var input = (inputElement.value || "");

	//else remove all childs and start again.
	while (suggestionList.firstChild)
		suggestionList.removeChild(suggestionList.firstChild);

	suggestionList.appendChild(ons._util.createElement("<ons-list-header modifier='longdivider'>Stations</ons-list-header>"));



	if (input.trim().length == 0) {
		setupEmptyList(suggestionList, inputElement, length);
		return;
	}



	var regex = new RegExp(input, "i");
	selected_station = input;

	for (let key in station_abrevs) {
		if (regex.test(key)) {//If input 
			var currstation = station_data[station_abrevs[key]];

			var optionListItem = ons._util.createElement("<ons-list-item ripple modifier='longdivider'></ons-list-item>");
			var optionHref = document.createElement("div");
			optionHref.setAttribute("class", "left");
			optionListItem.onclick = function (event) {
				inputElement.value = key;
				selected_station = key;
			};
			optionHref.innerHTML = "<p>" + key + "</p>";
			optionListItem.appendChild(optionHref);

			var rightelem = document.createElement("div");
			rightelem.setAttribute("class", "right");

			var dummy = document.createElement("div");
			dummy.setAttribute("class", "center");
			optionListItem.appendChild(dummy);

			var isOpen = (currstation.open.toLowerCase() == "yes");


			rightelem.innerHTML = isOpen ? "<ons-icon icon='ion-android-bicycle'>&#32;" + (currstation.extra.rentalBikes || 0) + "</ons-icon>"
				: "<ons-icon icon='ion-alert-circled' color='red'></ons-icon>";



			optionListItem.appendChild(rightelem);
			suggestionList.appendChild(optionListItem);

			if (--length <= 0) break;
		}
	}
}

function setupEmptyList(suggestionList, inputElement, length) {
	var sortedStations = Object.keys(station_data);
	sortedStations.sort(function (a, b) {
		return (station_data[b].open.toLocaleLowerCase() === "yes" ? station_data[b].extra.rentalBikes : 0)
			- (station_data[a].open.toLocaleLowerCase() === "yes" ? station_data[a].extra.rentalBikes : 0);
	});

	for (let i = 0; i < length; i++) {
		var optionListItem = ons._util.createElement("<ons-list-item ripple modifier='longdivider'></ons-list-item>");
		var optionHref = document.createElement("div");
		optionHref.setAttribute("class", "left");
		optionListItem.onclick = function (event) {
			inputElement.value = station_data[sortedStations[i]].description;
			selected_station = station_data[sortedStations[i]].description;
		};
		optionHref.innerHTML = "<p>" + station_data[sortedStations[i]].description + "</p>";
		optionListItem.appendChild(optionHref);


		var rightelem = document.createElement("div");
		rightelem.setAttribute("class", "right");


		var dummy = document.createElement("div");
		dummy.setAttribute("class", "center");
		optionListItem.appendChild(dummy);

		var isOpen = (station_data[sortedStations[i]].open.toLowerCase() == "yes");


		rightelem.innerHTML = isOpen ? "<ons-icon icon='ion-android-bicycle'>&#32;" + (station_data[sortedStations[i]].extra.rentalBikes || 0) + "</ons-icon>"
			: "<ons-icon icon='ion-alert-circled' color='red'></ons-icon>";


		optionListItem.appendChild(rightelem);
		suggestionList.appendChild(optionListItem);

	}
}

function setupSecondaryPage() {
	var abrev = station_abrevs[selected_station];
	var currstation = station_data[abrev];

	//console.log("this will be displayed on the page:",currstation);

	var date = new Date(currstation.extra.fetchTime * 1000);

	var informationParent = document.getElementById("informationParent");
	informationParent.querySelector("#stationName").innerHTML = currstation.description;
	informationParent.querySelector("#openClosed").innerHTML = currstation.open === "Yes" ? "Open" : "Gesloten";

	informationParent.querySelector("#rentalBikesCount").innerHTML = (currstation.extra.rentalBikes || 0) + " fietsen beschikbaar";

	var minutesAgo = (new Date().getMinutes() - date.getMinutes()).clamp(0, 100);
	informationParent.querySelector("#lastUpdated").innerHTML = (minutesAgo <= 1) ? "Minder dan 1 minuut geleden" : minutesAgo + " minuten geleden";

	var closingAndOpeningTimes = informationParent.querySelector("#times");
	var times = currstation.openingHours;
	for (let i = 0; i < 7; i++) {
		var day = IndexToDay(i).toLowerCase();
		closingAndOpeningTimes.querySelector("#" + day).innerHTML = "Gesloten";
	}

	for (let i = 0; i < currstation.openingHours.length; i++) {
		var day = IndexToDay(currstation.openingHours[i].dayOfWeek - 1);

		var openTime = NormalizeTimeString(currstation.openingHours[i].startTime.trim());
		var closingTime = NormalizeTimeString(currstation.openingHours[i].endTime.trim());

		if (openTime !== closingTime && currstation.openingHours[i].closesNextDay) {
			closingAndOpeningTimes.querySelector("#" + day.toLocaleLowerCase()).innerHTML
				= currstation.openingHours[i].startTime + " - " + currstation.openingHours[i].endTime + " na middernacht";
		}
		else {
			closingAndOpeningTimes.querySelector("#" + day.toLocaleLowerCase()).innerHTML
				= currstation.openingHours[i].startTime + " - " + currstation.openingHours[i].endTime;
		}
	}
}