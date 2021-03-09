
const signup = document.querySelector('#signup');
const login = document.querySelector('#login');

var publicKeyCredentialToJSON = (pubKeyCred) => {
  if(pubKeyCred instanceof Array) {
      let arr = [];
      for(let i of pubKeyCred)
          arr.push(publicKeyCredentialToJSON(i));

      return arr
  }

  if(pubKeyCred instanceof ArrayBuffer) {
      return base64url.encode(pubKeyCred)
  }

  if(pubKeyCred instanceof Object) {
      let obj = {};

      for (let key in pubKeyCred) {
          obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
      }

      return obj
  }

  return pubKeyCred
}

//controllo se la WebAuthnAPI è supportata 
if (!window.PublicKeyCredential)
  console.log('WebAuthn API not supported')


let credentialsId = null;
if (signup)
  signup.addEventListener('click', () =>
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then( isAvaiable => {
        if (!isAvaiable) 
          console.log('Missing user-verifying authenticators')
        else 
          //chiedere all'utente se vuole creare le credenziali, supponiamo di si
          return true; 
      })
      .then( userResponse => {
        if (userResponse) {
          var publicKeyOptions = {
            challenge: Uint8Array.from('ABCDEFGHJKMOJDIFJIOJISDJSAPOQSVX', c => c.charCodeAt(0)),
            rp: {name: 'PWADemo', id: 'pwappocrate.herokuapp.com'},
            user: {
              id: Uint8Array.from(window.atob("MIIBkzCCATigAwIBAjCCAZMwggE4oAMCAQIwggGTMII="), c=>c.charCodeAt(0)),
              name: 'utente1@g.com',
              displayName: 'Mario Rossi'
            },
            pubKeyCredParams: [ {type: "public-key", alg: -7} ],
            timeout: 5 * 60 * 1000,
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' }
          };
          return navigator.credentials.create({'publicKey': publicKeyOptions});
        }
      })
      .then( credentials => {
        console.log( credentials );
        console.log(credentials.id);

        // decode the clientDataJSON into a utf-8 string
        const utf8Decoder = new TextDecoder('utf-8');
        const decodedClientData = utf8Decoder.decode(credentials.response.clientDataJSON);

        // parse the string as an object
        const clientDataObj = JSON.parse(decodedClientData);

        clientDataObj['publicKey'] = credentials.response.attestationObject;
        clientDataObj['credentialsId'] = credentials.id;
        credentialsId = credentials.id;

        console.log(clientDataObj);

        publicKeyCredentialToJSON
        
        return fetch('/signup' , {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(clientDataObj)
        })
      })
      .then( res => confirm('Registrato con successo!'))
      .then( res => signup.parentNode.removeChild(signup) )
      .catch( e => console.log(e))
  )

if (login)
  login.addEventListener('click', () => {

    const base64Id = window.btoa('Ej_1cfBcad6TVO1choHVQljaoisjaisj');
    const bufferId = Uint8Array.from(window.atob(base64Id), c=>c.charCodeAt(0));

    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);
    // const bufferChallenge = Uint8Array.from(randomChallenge, c=>c.charCodeAt(0));

    var encoder = new TextEncoder();
    var acceptableCredential = {
      type: "public-key",
      id: bufferId,
      transports: ['internal']
    };
    navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge,
        // allowCredentials: [{
        //   id: Uint8Array.from(credentialsId, c => c.charCodeAt(0)),
        //   type: 'public-key',
        //   transports: ['internal']
        // }],
        allowCredentials: [acceptableCredential],
        userVerification: 'required'
      }
    })
    .then( assertion => {
      console.log(assertion);
    })
    .catch( e => console.log(e))
  });




