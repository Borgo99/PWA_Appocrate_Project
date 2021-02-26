
const timeBtn = document.querySelector('#timeBtn');
const addBtn = document.querySelector('#addBtn');
const notes = document.querySelector('#notes');
const photoBtn = document.querySelector('#photoBtn');
const enableNotificationsBtn = document.querySelector('#enableNotificationBtn');
const showNotificationBtn = document.querySelector('#showNotificationBtn');

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
        const options = {
          body: 'Questa è la notifica da te richiesta!',
          icon: '/img/logo48.png',
          badge: '/img/logo48.png',
          lang: 'it-IT',
          tag: 'sw-notification'
        };
        //sw.showNotification('Notifica da Appocrate', options);

        //iscrizione al servizio di notifiche
        swreg = sw;
        return swreg.pushManager.getSubscription();
      })
      .then( sub => {
        if (sub === null) {
          //se non ci siamo precedentemente iscritti, allora creiamo una nuova iscrizione
          const vapidPublicKey = 'BAEiFaXKJJ5S1IhjfcLQrbZmwHEzScmKC1Ntbaf0ZpJpOmqL57i7j6hKOUxmJzpZ9uYMHRRFOSOgmEfJIqaazlU';
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
      .then( newSub => {
        //console.log(newSub.endpoint);
        return fetch('/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSub)
        })
      })
      .then( res => {
        console.log(res.json());
        if (res.ok)
          swreg.showNotification('Iscritto ad Appocrate!');
      })
      .catch( err => console.log(err));
  }
});

timeBtn.addEventListener('click', () => {
  const markup = `<h3 style="text-align: center;">${new Date()}</h3>`;
  timeBtn.insertAdjacentHTML('afterend', markup);
});

photoBtn.addEventListener('click', () => {
  fetch('https://picsum.photos/200').then( response => {
    let markup = `
      <img src='${response.url}' />
    `;
    photoBtn.insertAdjacentHTML('afterend', markup);
    photoBtn.parentNode.removeChild(photoBtn);
  });
})



/* addBtn.addEventListener('click', () => {
  let markup = `
    <input type="text" name="note" id="note">
    <p id='addNote'>Aggiungi</p>
  `;
  notes.insertAdjacentHTML('afterbegin', markup);
}); */

/* notes.addEventListener('click', e => {
  if (e.target.id === 'addNote') {
    const note = document.querySelector('#note');
    let markup = `
      <p>${note.value}</p> 
      <p id='saveBtn' style="text-decoration: underline;">Salva nota</p>
    `;
    notes.insertAdjacentHTML('beforeend', markup);
    note.parentNode.removeChild(note);
    const addNoteBtn = document.querySelector('#addNote');
    addNoteBtn.parentNode.removeChild(addNoteBtn);
  }
  else if (e.target.id === 'saveBtn') {
    console.log('Saving data in cache');
    if ('caches' in window) {
      caches.open('user-cache').then( cache => {
        cache.add('/pwa.html');
      });
    }
  }
}); */



