var station_abrevs;
var selected_station;
var station_data;

ons.disableAutoStatusBarFill();

document.addEventListener("resume", function () {
	if (navigator.onLine === false) {
		ons.notification.alert({
			message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd.',
		});
	}
}, false);

document.addEventListener('init', function (event) {
	var page = event.target;

	if (page.id === 'main-page') {
		page.querySelector('#go-button').addEventListener('click', function () {
			var input = document.getElementById("inputStation").value;
			var keys = [];
			for (var key in station_abrevs) {
				keys.push(key);
			}
			if (keys.indexOf(input) === -1) {
				ons.notification.alert({
					message: 'Locatie bestaat niet.',
				});
				return;
			}
			document.getElementById('Navigator').pushPage('fietsen.html', { data: { title: selected_station + " OV Fietsen" }, callback: setupSecondaryPage });
		});
		var station_input = document.getElementById("inputStation");
		station_input.oninput = onStationInput;
	} else if (page.id === 'secondary-page') {
		page.querySelector ? page.querySelector('ons-toolbar .center').innerHTML = page.data.title : null;

		var abrev = station_abrevs[selected_station];
		window.currstation = station_data[abrev];

		window.pageReady = true;
		preparingMap();
	}
});

ons.ready(function () {
	var isOnline = function () {
		RequestAPIData();
	}, isOffline = function () {
		ons.notification.alert({
			message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd.',
		});
	};

	if (window.addEventListener) {
		window.addEventListener("online", isOnline, false);
		window.addEventListener("offline", isOffline, false);
	}
	else {
		document.body.ononline = isOnline;
		document.body.onoffline = isOffline;
	}

	if (cordova.platformId === 'browser') {
		document.body.appendChild(document.createElement('script')).src = './js/browser.js';
	} else {
		document.body.appendChild(document.createElement('script')).src = './js/admob.js';
	}

	if (navigator.onLine === false) {
		ons.notification.alert({
			message: 'Je bent niet verbonden met het internet. De gegevens die worden weergegeven zijn mogelijk verouderd',
		});
	}

	RequestAPIData();
	setInterval(RequestAPIData, 2 * 60 * 1000 /*10 min*/);

	document.getElementById('wait').style.display = 'none';
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

//Load data
function RequestAPIData(callback) {
	var url = location.protocol != 'https:'
		? 'http://fiets.openov.nl/locaties.json'
		: 'https://jsonp.afeld.me/?url=http://fiets.openov.nl/locaties.json';
	httpGetJSONRequest(url, function (data) {
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

function onStationInput(event, length) {
	length = length || 8;
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

	for (var key in station_abrevs) {
		if (regex.test(key)) {//If input 
			var currstation = station_data[station_abrevs[key]];

			var optionListItem = ons._util.createElement("<ons-list-item ripple modifier='longdivider'></ons-list-item>");
			var optionHref = document.createElement("div");
			optionHref.setAttribute("class", "left");
			optionListItem.onclick = function (event) {
				inputElement.value = key;
				selected_station = key;

				document.getElementById('Navigator').pushPage('fietsen.html', { data: { title: selected_station + " OV Fietsen" }, callback: setupSecondaryPage });
			};
			optionHref.innerHTML += '<ons-ripple></ons-ripple>'
			optionHref.innerHTML += "<p>" + key + "</p>";
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

	for (var j = 0; j < length; j++) {
		(function (i) {
			var optionListItem = ons._util.createElement("<ons-list-item ripple modifier='longdivider'></ons-list-item>");
			var optionHref = document.createElement("div");
			optionHref.setAttribute("class", "left");
			optionListItem.onclick = function (event) {
				inputElement.value = station_data[sortedStations[i]].description;
				selected_station = station_data[sortedStations[i]].description;
				
				document.getElementById('Navigator').pushPage('fietsen.html', { data: { title: selected_station + " OV Fietsen" }, callback: setupSecondaryPage });
			};
			optionHref.innerHTML += '<ons-ripple></ons-ripple>'
			optionHref.innerHTML += "<p>" + station_data[sortedStations[i]].description + "</p>";
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

		})(j);
	}
}

function setupSecondaryPage() {
	var abrev = station_abrevs[selected_station];
	var currstation = station_data[abrev];

	var date = new Date(currstation.extra.fetchTime * 1000);

	var informationParent = document.getElementById("informationParent");
	document.getElementById("stationName").innerHTML = currstation.description;
	document.getElementById("openClosed").innerHTML = currstation.open === "Yes" ? "Open" : "Gesloten";

	document.getElementById("rentalBikesCount").innerHTML = (currstation.extra.rentalBikes || 0) + " fietsen beschikbaar";

	var minutesAgo = (new Date().getMinutes() - date.getMinutes()).clamp(0, 100);
	document.getElementById("lastUpdated").innerHTML = (minutesAgo <= 1) ? "Minder dan 1 minuut geleden" : minutesAgo + " minuten geleden";

	var closingAndOpeningTimes = document.getElementById("times");
	var times = currstation.openingHours;
	for (var i = 0; i < 7; i++) {
		var day = IndexToDay(i).toLowerCase();
		document.getElementById(day).innerHTML = "Gesloten";
	}

	for (var i = 0; i < currstation.openingHours.length; i++) {
		var day = IndexToDay(currstation.openingHours[i].dayOfWeek - 1);

		var openTime = NormalizeTimeString(currstation.openingHours[i].startTime.trim());
		var closingTime = NormalizeTimeString(currstation.openingHours[i].endTime.trim());

		if (openTime !== closingTime && currstation.openingHours[i].closesNextDay) {
			document.getElementById(day.toLocaleLowerCase()).innerHTML
				= currstation.openingHours[i].startTime + " - " + currstation.openingHours[i].endTime + " na middernacht";
		}
		else {
			document.getElementById(day.toLocaleLowerCase()).innerHTML
				= currstation.openingHours[i].startTime + " - " + currstation.openingHours[i].endTime;
		}
	}
}

function blockTouchMove(event) {
	event.preventDefault();
	event.stopPropagation();
}

