const loginForm = document.querySelector('#login-form');
loginForm.style.display = 'block';
document.querySelector('#login').style.display = 'none';
document.querySelector('#signup').style.display = 'none';

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    
    fetch('/loginForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({username, password})
    })
    .then( res => {
      return res.json();
    })
    .then( response => {
      if (response.status === 'success') {
        loginForm.style.display = 'none';
        const markup = `<p>Bentornato ${username} !</p>`;
        loginForm.insertAdjacentHTML('afterend', markup);
      } 
      else location.assign('/html/contact.html');
    })
    .catch(err => console.log(err));

  });