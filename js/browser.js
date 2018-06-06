if (navigator['serviceWorker']) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (registration) {
        console.log('Service worker successfully registered on scope', registration.scope);

    }).catch(function (error) {
        console.log('Service worker failed to register');
    });
}

let installPromptEvent;

window.addEventListener('beforeinstallprompt', (event) => {
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
    installPromptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        // Clear the saved prompt since it can't be used again
        installPromptEvent = null;
    });
}
