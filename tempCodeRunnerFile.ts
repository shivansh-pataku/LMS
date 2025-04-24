const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 10; // Number of salt rounds for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

// Example usage
hashPassword('yourSecurePassword').then(hashed => {
    console.log('Hashed Password:', hashed);
});