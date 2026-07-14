require('dotenv').config();

const { hashPassword, comparePassword } = require('./utils/password');
const {
  generateAccessToken,
  verifyAccessToken,
} = require('./utils/jwt');

async function main() {
  // Test password hashing
  const password = 'mypassword123';
  const hash = await hashPassword(password);
  console.log('Hash:', hash);

  const match = await comparePassword(password, hash);
  console.log('Password match:', match); // should be true

  const wrong = await comparePassword('wrongpassword', hash);
  console.log('Wrong password match:', wrong); // should be false

  // Test JWT
  const fakeUser = { id: 1, role: 'USER' };
  const token = generateAccessToken(fakeUser);
  console.log('Token:', token);

  const decoded = verifyAccessToken(token);
  console.log('Decoded:', decoded);
}

main().catch(console.error);