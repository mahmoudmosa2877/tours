import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettingsData } from './updateSettings';
import { bookTour } from './stripe';

const formDiv = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutBut = document.querySelector('.nav__el--logout');
const updateSettingsBtn = document.querySelector('.form-user-data');
const updateSettingsPasswoBtn = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (formDiv) {
  formDiv.addEventListener('submit', el => {
    el.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login(email, password);
  });
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (logoutBut) {
  logoutBut.addEventListener('click', logout);
}

if (updateSettingsBtn) {
  updateSettingsBtn.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.querySelector('#name').value;
    // const email = document.querySelector('#email').value;
    updateSettingsData(form, 'data');
  });
}

if (updateSettingsPasswoBtn) {
  updateSettingsPasswoBtn.addEventListener('submit', event => {
    event.preventDefault();
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordconfirm = document.querySelector('#password-confirm').value;
    updateSettingsData(
      {
        passwordConfirm: passwordCurrent,
        newPassword: password,
        newPasswordConfirm: passwordconfirm
      },
      'password'
    );
  });
}
if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'processing .....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
