const timeBtn = document.querySelector('#timeBtn');
const photoBtn = document.querySelector('#photoBtn');
//const signup = document.querySelector('#signup');


timeBtn.addEventListener('click', () => {
  const markup = `<h5 class="mb-3 px-3">${new Date()}</h5>`;
  timeBtn.insertAdjacentHTML('afterend', markup);
});

photoBtn.addEventListener('click', () => {
  fetch('https://picsum.photos/200').then( response => {
    let markup = `
      <img src='${response.url}' class='img-thumbnail border border-primary border-3 my-3'/>
    `;
    photoBtn.insertAdjacentHTML('afterend', markup);
    photoBtn.parentNode.removeChild(photoBtn);
  });
})


// TENTATIVO CON WEBAUTHN API (questo codice funziona con Android e non su iOS)
// const vapidPublicKey = 'BAEiFaXKJJ5S1IhjfcLQrbZmwHEzScmKC1Ntbaf0ZpJpOmqL57i7j6hKOUxmJzpZ9uYMHRRFOSOgmEfJIqaazlU';

// PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
//   .then( condition => {
//     if (!condition) 
//       console.log('Missing user-verifying authenticators')
//   });
// if (!window.PublicKeyCredential)
//   console.log('WebAuthn API not supported')


// if (signup)
//   signup.addEventListener('click', async () => {
//     console.log('Challenge:', Uint8Array.from('ABCDEFGHJKM', c => c.charCodeAt(0)));
//     try {

//       const publickKey = {
//         challenge: Uint8Array.from('ABCDEFGHJKM', c => c.charCodeAt(0)),
//         rp: { 
//           id: "pwappocrate.herokuapp.com", 
//           name: "HerokuDemoPWA" },
//         user: {
//           id: Uint8Array.from('UZSL85T9AFM', c => c.charCodeAt(0)),
//           name: "mario",
//           displayName: "Mario Rossi"
//         },
//         pubKeyCredParams: [ {type: "public-key", alg: -7} ], //-7 means that server accepts Elliptic Curve public keys with SHA-256
//         timeout: 60 * 1000,
//         authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' }
//       }

//       let credential = await navigator.credentials.create({ 
//         publicKey: publickKey
//       });
//       console.log(credential);
      
//       // decode the clientDataJSON into a utf-8 string
//       const utf8Decoder = new TextDecoder('utf-8');
//       const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON)

//       // parse the string as an object
//       const clientDataObj = JSON.parse(decodedClientData);

//       console.log(clientDataObj)

//     } catch(err) {console.log(err)}
//   })


