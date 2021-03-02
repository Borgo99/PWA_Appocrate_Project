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

const csrfCheck = (req, res, next) => {
  if (req.header('X-Requested-With') != 'XMLHttpRequest') {
    res.status(400).json({ error: 'invalid access.' });
    return;
  }
  next();
};
const sessionCheck = (req, res, next) => {
  if (!req.session['signed-in']) {
    res.status(401).json({ error: 'not signed in.' });
    return;
  }
  next();
};
var db = [];
app.post('/registerRequest', csrfCheck, sessionCheck, async (req, res) => {
  const username = req.session.username;
  const user = db.get('users').find({ username: username }).value();
  try {
    const excludeCredentials = [];
    if (user.credentials.length > 0) {
      for (let cred of user.credentials) {
        excludeCredentials.push({
          id: cred.credId,
          type: 'public-key',
          transports: ['internal'],
        });
      }
    }
    const pubKeyCredParams = [];
    // const params = [-7, -35, -36, -257, -258, -259, -37, -38, -39, -8];
    const params = [-7, -257];
    for (let param of params) {
      pubKeyCredParams.push({ type: 'public-key', alg: param });
    }
    const as = {}; // authenticatorSelection
    const aa = req.body.authenticatorSelection.authenticatorAttachment;
    const rr = req.body.authenticatorSelection.requireResidentKey;
    const uv = req.body.authenticatorSelection.userVerification;
    const cp = req.body.attestation; // attestationConveyancePreference
    let asFlag = false;
    let authenticatorSelection;
    let attestation = 'none';

    if (aa && (aa == 'platform' || aa == 'cross-platform')) {
      asFlag = true;
      as.authenticatorAttachment = aa;
    }
    if (rr && typeof rr == 'boolean') {
      asFlag = true;
      as.requireResidentKey = rr;
    }
    if (uv && (uv == 'required' || uv == 'preferred' || uv == 'discouraged')) {
      asFlag = true;
      as.userVerification = uv;
    }
    if (asFlag) {
      authenticatorSelection = as;
    }
    if (cp && (cp == 'none' || cp == 'indirect' || cp == 'direct')) {
      attestation = cp;
    }

    const options = fido2.generateAttestationOptions({
      rpName: RP_NAME,
      rpID: process.env.HOSTNAME,
      userID: user.id,
      userName: user.username,
      timeout: TIMEOUT,
      // Prompt users for additional information about the authenticator.
      attestationType: attestation,
      // Prevent users from re-registering existing authenticators
      excludeCredentials,
      authenticatorSelection,
    });

    req.session.challenge = options.challenge;

    // Temporary hack until SimpleWebAuthn supports `pubKeyCredParams`
    options.pubKeyCredParams = [];
    for (let param of params) {
      options.pubKeyCredParams.push({ type: 'public-key', alg: param });
    }

    res.json(options);
  } catch (e) {
    res.status(400).send({ error: e });
  }
});

const port = process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log("Server is on.");
});


