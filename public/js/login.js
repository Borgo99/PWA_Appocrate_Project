const loginForm = document.querySelector('#login-form');

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
        const markup = `<p class="display-6">Bentornato ${username} !</p>`;
        loginForm.insertAdjacentHTML('afterend', markup);
      } 
      else alert('Invalid email or password');
    })
    .catch(err => console.log(err));

  });