const express = require('express');
const webpush = require('web-push');

//keys generated with 'web-push generate-vapid-keys'
const VAPID_PRIVATE_KEY = 'uVQffcyPzi1nE12jQuKryd4n3fOo4OHINwyj8dLc2JA';
const VAPID_PUBLIC_KEY = 'BAEiFaXKJJ5S1IhjfcLQrbZmwHEzScmKC1Ntbaf0ZpJpOmqL57i7j6hKOUxmJzpZ9uYMHRRFOSOgmEfJIqaazlU';

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());



app.get('/home', (req, res) => {

  res.status(200).redirect('/index.html');
});

app.post('/subscriptions', async (req, res) => {
  console.log('Someone subscribed!');

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
      openUrl: '/html/contact.html' //link che si apre al click sulla notifica
    };
    const options = 
      webpush.setVapidDetails(
        'mailto:address@gmail.com', 
        VAPID_PUBLIC_KEY, 
        VAPID_PRIVATE_KEY
      );

    webpush.sendNotification(pushConfig, JSON.stringify(pushContent), options)
      .catch(err => console.log(err));

  }, 6000);

  res.status(200).json({
    status: 'success',
    ok: true
  });
});

const registredIp = [];
app.get('/isRegistred', (req, res) => {
  if (registredIp.includes(req.ip)) res.status(200).send(true);
  else res.status(200).send(false);
});
const users = [];
app.post('/signup', (req, res) => {
  if (!registredIp.includes(req.ip)) registredIp.push(req.ip);

  /**
   * req.body = {
   *  type: 'webauthn.create',
      challenge: 'QUJDREVGR0hKS01PSkRJRkpJT0pJU0RKU0FQT1FTVlg',
      origin: 'https://pwappocrate.herokuapp.com',
      androidPackageName: 'com.android.chrome'
   * }
   */

  if (req.body.type !== 'webauthn.create') return 'Signup type error';

  if (req.body.origin !== "https://pwappocrate.herokuapp.com")
    return 'Signup origin error';
    
  users.push({
    'user': req.ip,
    'challenge': req.body.challenge,
    'publicKey': req.body.publicKey
  });
  
  res.status(201).json({status: 'success'});
});

const usersCredentials = {};
usersCredentials['Mario'] = 'ciao';
app.post('/loginForm', (req, res) => {

  console.log('[Login]:', req.body.username);

  if (usersCredentials[req.body.username] === req.body.password)
    return res.status(200).json({status: 'success'});

  res.status(400).json({status: 'failed'});
});

const port = process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log("Server is on.");
});


