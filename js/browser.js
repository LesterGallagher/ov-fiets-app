if (navigator['serviceWorker']) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (registration) {
        console.log('Service worker successfully registered on scope', registration.scope);

    }).catch(function (error) {
        console.log('Service worker failed to register');
    });
}

if (navigator.userAgent.indexOf('MSIE') !== -1
	|| navigator.appVersion.indexOf('Trident/') > 0) {
	document.body.appendChild(document.createElement('div')).innerHTML = '<div id="oldbrowser-modal" class="modal" role="dialog" aria-expanded="true" \
	style="position: fixed; z-index: 200000; padding-top: 100px; left: 0px; top: 0px; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.9); \
	transition: padding-top 100ms ease-out; box-sizing: border-box; font-family: "Ubuntu", sans-serif, Verdana, Geneva, Tahoma;">\
	<div class="modal-content" style="margin: auto; display: block; width: 80%; max-width: 700px; padding: 40px; background: white; box-sizing: border-box; ;">\
		<h2 class="text-danger mt-1 mb-4" style="color: rgb(236, 78, 32); margin-top: 6px; margin-bottom: 36px; box-sizing: border-box; ;">Belangrijk!</h2>\
		<p class="noscript-msg" style="box-sizing: border-box; ;">\
			Je gebruikt een oudere\
			<strong class="text-danger">outdated</strong> browser.\
			<a href="http://browsehappy.com/" class="text-success" style="style="background-color: transparent; color: rgb(1, 111, 185); box-sizing: border-box; \
			text-decoration: none;">Update je browser</a> om je ervaring te verbeteren.\
		</p>\
	</div>\
</div>'.split('\n').join('');
}

var installPromptEvent;

window.addEventListener('beforeinstallprompt', function(event) {
    // Prevent Chrome <= 67 from automatically showing the prompt
    event.preventDefault();
    // Stash the event so it can be triggered later.
    installPromptEvent = event;
    // Update the install UI to notify the user app can be installed
    var btnContainers = document.getElementsByClassName('add-to-homescreen');
    for (var i = 0; i < btnContainers.length; i++) {
        btnContainers[i].style.display = 'block';
    }
    var scrolltoElem = btnContainers[btnContainers.length - 1];
    scrolltoElem.scrollIntoView({
        behavior: 'smooth'
    });
});

function pwaHomeScreenInstall() {
    if (!installPromptEvent) return;
    // Update the install UI to remove the install button
    var btnContainers = document.getElementsByClassName('add-to-homescreen');
    for (var i = 0; i < btnContainers.length; i++) {
        btnContainers[i].style.display = 'none';
    }
    // Show the modal add to home screen dialog
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(function(choice) {
        if (choice.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        // Clear the saved prompt since it can't be used again
        installPromptEvent = null;
    });
}
