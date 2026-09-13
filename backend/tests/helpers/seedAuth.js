import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import User from '../../models/user.model.js';

export const createTestUsersAndTokens = async () => {
  const timestamp = Date.now() + Math.floor(Math.random() * 10000);

  // 1. Create or Find Student
  let student = await User.findOne({ email: 'student@test.com' });
  if (!student) {
    student = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      username: `student_${timestamp}`,
      password: 'password123',
      role: 'user',
      active: true,
    });
  }

  // 2. Create or Find Instructor
  let instructor = await User.findOne({ email: 'instructor@test.com' });
  if (!instructor) {
    instructor = await User.create({
      name: 'Test Instructor',
      email: 'instructor@test.com',
      username: `instructor_${timestamp}`,
      password: 'password123',
      role: 'instructor',
      active: true,
    });
  }

  // 3. Create or Find Admin
  let admin = await User.findOne({ email: 'admin@test.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      username: `admin_${timestamp}`,
      password: 'password123',
      role: 'admin',
      active: true,
    });
  }

  // Generate tokens
  const studentToken = jwt.sign({ id: student._id.toString() }, config.jwtSecret, { expiresIn: '1d' });
  const instructorToken = jwt.sign({ id: instructor._id.toString() }, config.jwtSecret, { expiresIn: '1d' });
  const adminToken = jwt.sign({ id: admin._id.toString() }, config.jwtSecret, { expiresIn: '1d' });

  return {
    student: { user: student, token: studentToken },
    instructor: { user: instructor, token: instructorToken },
    admin: { user: admin, token: adminToken },
  };
};
