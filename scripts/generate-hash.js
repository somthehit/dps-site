const bcrypt = require('bcryptjs');

const password = 'Admin@123';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash for Admin@123:', hash);
