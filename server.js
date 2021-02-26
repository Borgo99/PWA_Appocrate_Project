const express = require('express');
const webpush = require('web-push');

//keys generated with 'web-push generate-vapid-keys'
const VAPID_PRIVATE_KEY = 'uVQffcyPzi1nE12jQuKryd4n3fOo4OHINwyj8dLc2JA';
const VAPID_PUBLIC_KEY = 'BAEiFaXKJJ5S1IhjfcLQrbZmwHEzScmKC1Ntbaf0ZpJpOmqL57i7j6hKOUxmJzpZ9uYMHRRFOSOgmEfJIqaazlU';

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());



app.get('/', (req, res) => {
  console.log('dsnj');
  res.status(200).redirect('/index.html');
});

app.post('/subscriptions', async (req, res) => {
  console.log('Someone subscribed!');
  //console.log(req.body);

  webpush.setVapidDetails('mailto:address@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  setTimeout( () => {
    
    const pushConfig = {
      endpoint: req.body.endpoint,
      keys: {
        auth: req.body.keys.auth,
        p256dh: req.body.keys.p256dh
      }
    };
    const pushContent = {
      title: 'Ciao da Appocrate 👋🏻' ,
      content: 'Messaggio dal server di Appocrate',
      openUrl: '/html/contact.html'
    };

    webpush.sendNotification(pushConfig, JSON.stringify(pushContent))
      .catch(err => console.log(err));

  }, 6000);

  res.status(200).json({
    status: 'success',
    ok: true
  });
});

const port = process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log("Server is on.");
});


