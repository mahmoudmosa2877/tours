import axios from 'axios';
import { showAlert } from './alert';

export const updateSettingsData = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/users/updatePassword'
      : '/api/v1/users/updateMe';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', 'the update is done successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const updateSettingsPassword = async (
//   passwordConfirm,
//   newPassword,
//   newPasswordConfirm
// ) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
//       data: {
//         passwordConfirm,
//         newPassword,
//         newPasswordConfirm
//       }
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'the update is done successfully');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
