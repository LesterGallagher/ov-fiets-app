
var stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.type = "text/css";
stylesheet.href = "lib/time_bar/time_bar.css";
document.head.appendChild(stylesheet);


function create (containerElement,openingHours,currTime)
{
    //create canvas
    var graphContainer = document.createElement("div");
    graphContainer.setAttribute("id","graphContainer");
    containerElement.appendChild(graphContainer);

    var fetchDaysInLang;//is a function;

    var lang = window.localStorage.getItem("lang");
    switch((lang && lang.toLowerCase())){
        case "dutch":
        fetchDaysInLang = IndexToDayDutch;
        break;
        case "english":
        fetchDaysInLang = IndexToDay;
        break;
        default:
        fetchDaysInLang = function(index){ return (IndexToDayDutch(index)+" \ "+IndexToDay(index))};
        break;
    }

    for(let i = 0;i<24;i++)
    {
        var seperator = document.createElement("div");
        seperator.setAttribute("class","seperator");
        graphContainer.appendChild(seperator);

        if (i%4 !== 0){
            seperator.setAttribute("style","opacity:0.1;");
        }
        else seperator.setAttribute("style","opacity:0.5;");
    }
    seperator.setAttribute("style","border-right:2px solid #999");

    var currentTime = currTime.split(':')[0].toNumber()*60 + currTime.split(':')[1].toNumber();//Minutes;
    currentTime = currentTime/14.4;

    var days = new Array(7);
    for(let i = 0;i < 7;i++)
    {
        if(openingHours[i] === undefined || openingHours[i] === null)
            continue;

        days[parseInt(openingHours[i].dayOfWeek-1)] = openingHours[i];
    }
    
    for(let i = 0; i < 7; i++)
    {
        var currday = days[i];
        if (currday === undefined){
            var emptycontainer = document.createElement("div");
            emptycontainer.setAttribute("class","dayContainer");
            graphContainer.appendChild(emptycontainer);
            var dayOfWeekTextClosed = document.createElement("div");
            dayOfWeekTextClosed.innerHTML = fetchDaysInLang(i);
            dayOfWeekTextClosed.setAttribute("class","dayOfTheWeekTextClosed");
            dayOfWeekTextClosed.setAttribute("align","center");

            var dayOfTheWeekContainerClosed = document.createElement("div");
            dayOfTheWeekContainerClosed.setAttribute("class","dayOfTheWeekContainerClosed");
            dayOfTheWeekContainerClosed.appendChild(dayOfWeekTextClosed);

            emptycontainer.appendChild(dayOfTheWeekContainerClosed);
            continue;
        }

        var daycontainer = document.createElement("div");
        daycontainer.setAttribute("class","dayContainer");
        graphContainer.appendChild(daycontainer);
        var dayBar = document.createElement("div");
        dayBar.setAttribute("class","dayBar");
        daycontainer.appendChild(dayBar);
        var dayOfWeekText = document.createElement("div");
        dayOfWeekText.innerHTML = fetchDaysInLang(i);
        dayOfWeekText.setAttribute("class","dayOfTheWeekText");
        dayOfWeekText.setAttribute("align","center");
        var dayOfTheWeekContainer = document.createElement("div");
        dayOfTheWeekContainer.setAttribute("class","dayOfTheWeekContainer");
        dayOfTheWeekContainer.appendChild(dayOfWeekText);


        daycontainer.appendChild(dayOfTheWeekContainer);
        
        var _startTime = currday.startTime.split(':');
        var _endTime = currday.endTime.split(':');


        var startTime = _startTime[0].toNumber()*60 + _startTime[1].toNumber();//Minutes;
        var endTime = _endTime[0].toNumber()*60 + _endTime[1].toNumber();//Minutes;

        startTime = (startTime > 1435)? 0 : startTime;//Fix time in minutus.
        endTime = (endTime < 5)?1440 : endTime;//Fix time in minutus.

        if (currday.closesNextDay == false || (startTime < 5 && endTime > 1435))
        {
            //Singel bar.
            var bar = document.createElement("div");
            bar.setAttribute("style",`left: ${startTime/14.4}%;width: ${(endTime-startTime)/14.4}%;`);
            bar.setAttribute("class","timeBar");

            daycontainer.appendChild(bar);
        }
        else{
            //Multi bar.]
            var leftbar = document.createElement("div");//Closes after midnight:
            leftbar.setAttribute("class","timeBar");
            leftbar.setAttribute("style",`left: 0%;width: ${endTime/14.4}%;`);

            var rightbar = document.createElement("div");//Opens in the day:
            rightbar.setAttribute("class","timeBar");
            rightbar.setAttribute("style",`right: 0%;width: ${100 - startTime/14.4}%;`);

            daycontainer.appendChild(leftbar);
            daycontainer.appendChild(rightbar);
        }
    }
    function update (_time){
        seperator = document.createElement("div");
        seperator.setAttribute("class","currtime");
        seperator.setAttribute("style",`left: ${_time}%;`);
        graphContainer.appendChild(seperator);

        var currTimeText = document.createElement("p");
        currTimeText.innerHTML = _time.PercentagetoTimeString();
        currTimeText.setAttribute("class","currtimeText");
        seperator.appendChild(currTimeText);
        currTimeText.setAttribute("style",`left:${-currTimeText.offsetWidth/2}px;`);
    }update(currentTime);

    var curs_seperator = document.createElement("div");
    curs_seperator.setAttribute("class","curserTime");
    curs_seperator.setAttribute("style",`left: ${currentTime}%;`);
    graphContainer.appendChild(curs_seperator);

    var curserTimeText = document.createElement("p");
    curserTimeText.setAttribute("class","curserTimeText");
    curs_seperator.appendChild(curserTimeText);
    curserTimeText.innerHTML = "0" + (parseInt(currentTime/60).toString()).slice(-2)+":"+("0" + parseInt(currentTime%60).toString()).slice(-2);
    curserTimeText.setAttribute("style",`left:${-curserTimeText.offsetWidth/2}px;`);

    graphContainer.onpointerenter = function(){
         //console.log("mouse enter")
        graphContainer.addEventListener("pointermove",onMouseMove,true);
    };
    graphContainer.onpointerleave = function(){
        //console.log("mouse leave")
          curs_seperator.setAttribute("style","display:none");
          graphContainer.removeEventListener("pointermove",onMouseMove,true);
    };

    function onMouseMove (e){
         //console.log("mouse over")
        var X = (e.pageX - this.offsetLeft)/(this.offsetWidth/100);
        X = X.clamp(0,100);
        curs_seperator.setAttribute("style",`left: ${X.toString().slice(0,5)}%; display:visible`);
        var time = X * 14.4;
        //console.log(time);
        curserTimeText.innerHTML = "0" + (parseInt(time/60).toString()).slice(-2)+":"+("0" + parseInt(time%60).toString()).slice(-2);
    }

    containerElement.update = update;
    curs_seperator.setAttribute("style","display:none;");
    return containerElement;
}