const bcrypt = require('bcrypt');

async function createTestUser() {
  // Password yang sangat simple: "test123"
  const password = "test123";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Password asli:", password);
  console.log("Hashed password:", hashedPassword);
}

createTestUser();