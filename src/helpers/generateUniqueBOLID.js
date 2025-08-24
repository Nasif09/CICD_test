// const Load = require('../Load/load.model');

// async function generateUniqueBOLID() {
//     try {
//         const date = new Date();
//         const year = date.getFullYear().toString().slice(-2);
//         const month = String(date.getMonth() + 1).padStart(2, '0');

//         let newUserId = '';

//         const number = await Load.findOne().select('billOfLading').sort({ createdAt: -1 });
//         if (number && number.userId) {
//             const lastNumber = parseInt(number.userId.split('-')[2]);
//             const newNumber = (lastNumber + 1).toString().padStart(5, '0');
//             newUserId = newNumber;
//         } else {
//             newUserId = '00001';
//         }
//         const customID = `BOL-${month}${year}-${newUserId}`;

//         console.log(customID)
//         // return customID;
//     }
//     catch (err) {
//         console.log(err)
//     }
// }

// module.exports = generateUniqueBOLID