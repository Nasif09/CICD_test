const jwt = require('jsonwebtoken');

const tokenGenerator = async (user) => {
  const payload = { _id: user._id, fullName: user.fullName, email: user.email, image: user.image, role: user.role };
  return await jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: '1y',
  });
}

module.exports = {tokenGenerator};