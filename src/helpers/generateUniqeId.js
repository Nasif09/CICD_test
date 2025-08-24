// Function to generate a custom shipping ID
const generateUniqeId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '#'; // Start with #
    for (let i = 0; i < 5; i++) { // Generate 5 random characters
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  };
  module.exports = generateUniqeId;
  