
const downloadBtn = document.querySelector('#downloadBtn');
const addToHomeScreen = document.querySelector('.add-to-homescreen-popup');

if ("serviceWorker" in navigator ) {
  console.log('This browser supports SW!');
  //register a new service worker
  navigator.serviceWorker.register('./../service-worker.js').then( () => {
    console.log("SW registred successfully!");
  });
} else {
  console.log('Service worker not supported.');
  if (!window.isSecureContext) console.log('SW supportati solo in un Secure Context');
};


var promptEvent;

window.addEventListener('beforeinstallprompt', e => {
  console.log('beforeinstallprompt triggered');
  e.preventDefault();
  promptEvent = e;
  return false;
});

// Detects if device is on iOS 
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test( userAgent );
}

if (downloadBtn)
  if (isIos()) {
    downloadBtn.style.display = 'none';
    addToHomeScreen.style.display = 'block';
  } else {
    downloadBtn.addEventListener('click', () => {
      console.log('Clicked');
      if (promptEvent) {
        promptEvent.prompt();

        promptEvent.userChoice.then( choiceResult => {
          console.log(choiceResult.outcome);

          if (choiceResult.outcome === 'dismissed') {
            console.log('Installation cancelled.');
          } else {
            console.log('User accepted installation!'); 
          }
        } );

        promptEvent = null;

      }
    });
  }