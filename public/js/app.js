
const downloadBtn = document.querySelector('#downloadBtn');

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
  // console.log('beforeinstallprompt triggered');
  e.preventDefault();
  promptEvent = e;
  return false;
});

if (downloadBtn)
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