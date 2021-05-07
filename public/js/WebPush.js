const enableNotificationsBtn = document.querySelector('#enableNotificationBtn');
const showNotificationBtn = document.querySelector('#showNotificationBtn');

const vapidPublicKey = 'BAEiFaXKJJ5S1IhjfcLQrbZmwHEzScmKC1Ntbaf0ZpJpOmqL57i7j6hKOUxmJzpZ9uYMHRRFOSOgmEfJIqaazlU';

if (!('Notification' in window)) {
  enableNotificationsBtn.style.display = 'none';
}

enableNotificationsBtn.addEventListener('click', () => {
  if (!('Notification' in window)) return console.log('Notification not supported.');

  Notification.requestPermission( result => {
    if (result !== 'granted') return console.log('Permission for notifications denied.');
    console.log('Permission for notifications granted!');
    enableNotificationsBtn.parentNode.removeChild(enableNotificationsBtn);
    showNotificationBtn.style.display = 'block';
    //new ServiceWorkerRegistration.showNotification('Successfully subscribed!');
  })
});

// Public base64 to Uint
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
showNotificationBtn.addEventListener('click', () => {
  if ('serviceWorker' in navigator) {
    let swreg; //variabile di appoggio
    navigator.serviceWorker.ready
      .then( sw => {
        //iscrizione al servizio di notifiche
        swreg = sw;
        return swreg.pushManager.getSubscription();
      })
      .then( sub => {
        if (sub === null) {
          //se non ci siamo precedentemente iscritti, allora creiamo una nuova iscrizione
          const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
          return swreg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          });
        } else {
          //gestiamo l'iscrizione
          return sub;
        }
      })
      .then( sub => {
        //console.log(sub.endpoint);
        return fetch('/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(sub)
        })
      })
      .then( res => {
        const options = {
          body: 'Questa è la notifica da te richiesta!',
          icon: '/img/logo48.png',
          badge: '/img/logo48.png',
          lang: 'it-IT',
          tag: 'sw-notification'
        };
        if (res.ok)
          swreg.showNotification('Iscritto ad Appocrate!', options);
      })
      .catch( err => console.log(err));
  }
});