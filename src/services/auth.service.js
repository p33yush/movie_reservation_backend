const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');
const AppError = require('../utils/AppError');

async function register({ name, email, password }) {
  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // 2. Hash password
  const passwordHash = await hashPassword(password);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'USER',
    },
  });

  // 4. Return user WITHOUT password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { register };