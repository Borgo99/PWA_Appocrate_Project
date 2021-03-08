const signup = document.querySelector('#signup');

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
        console.log(credentials);
        fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {...credentials},
        })
        .then( res => confirm('Registrato con successo!'))
        ;
      })
      .catch( e => console.log(e))
  )



