
const signup = document.querySelector('#signup');
const login = document.querySelector('#login');

// console.log(Uint8Array.from(window.atob("MIIBkzCCATigAwIBAjCCAZMwggE4oAMCAQIwggGTMII="), c=>c.charCodeAt(0)));

//controllo se la WebAuthnAPI è supportata 
if (!window.PublicKeyCredential)
  console.log('WebAuthn API not supported')


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
        console.log(JSON.stringify( credentials ));
        console.log(credentials.id);

        // decode the clientDataJSON into a utf-8 string
        const utf8Decoder = new TextDecoder('utf-8');
        const decodedClientData = utf8Decoder.decode(credentials.response.clientDataJSON);

        // parse the string as an object
        const clientDataObj = JSON.parse(decodedClientData);

        console.log(clientDataObj);
        
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

  });




