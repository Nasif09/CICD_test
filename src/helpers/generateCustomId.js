// customIDGenerator.js
const User = require('../modules/User/user.model')
async function generateCustomID() {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');

    let newUserId = '';

    const number = await User.findOne().select('userId').sort({ createdAt: -1 });
    if (number && number.userId) {
      const lastNumber = parseInt(number.userId.split('-')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(5, '0');
      newUserId = newNumber;
    } else {
      newUserId = '00001';
    }
    const customID = `OOTMS-${month}${year}-${newUserId}`;
    return customID;
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = generateCustomID;
