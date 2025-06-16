const bcrypt = require('bcrypt');

async function createAdminPassword() {
  // Password yang akan digunakan admin
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Password admin:", password);
  console.log("Hashed password admin:", hashedPassword);
}

createAdminPassword();