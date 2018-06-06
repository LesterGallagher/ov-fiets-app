
function httpGetJSONRequest(url, callback, errormessage) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var data = JSON.parse(this.responseText);
                callback(data);
            }
            //ERROR!:
            else {
                console.error('Kan geen connectie maken met de server.');
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes;
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

String.prototype.toNumber = function () {
    return parseInt(this);
};

String.prototype.toMinutes = function () {
    return this.split(':')[0].toNumber() * 60 + this.split(':')[1].toNumber();//Minutes;
};

Number.prototype.toTimeString = function () {
    return ("0" + parseInt(this / 60).toString()).slice(-2) + ":" + ("0" + parseInt(this % 60).toString()).slice(-2);
};

Number.prototype.PercentagetoTimeString = function () {
    var minutes = this * 14.4;
    return ("0" + parseInt(minutes / 60).toString()).slice(-2) + ":" + ("0" + parseInt(minutes % 60).toString()).slice(-2);
};

function IndexToDayDutch(index) {
    switch (index) {
        case 0:
            return "Maandag";
        case 1:
            return "Dinsdag";
        case 2:
            return "Woensdag";
        case 3:
            return "Donderdag";
        case 4:
            return "Vrijdag";
        case 5:
            return "Zaterdag";
        case 6:
            return "Zondag";
        default:
            return "Onbekend";
    }
}
function IndexToDay(index) {
    switch (index) {
        case 0:
            return "Monday";
        case 1:
            return "Tuesday";
        case 2:
            return "Wednesday";
        case 3:
            return "Thursday";
        case 4:
            return "Friday";
        case 5:
            return "Saturday";
        case 6:
            return "Sunday";
        default:
            return "Unknown";
    }
}

function NormalizeTimeString(timeString) {
    if (timeString === "00:00" || timeString === "23:59" || timeString === "24:00") {
        return "00:00";
    }
    else return timeString;
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};