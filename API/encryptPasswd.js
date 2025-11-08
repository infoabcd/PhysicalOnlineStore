const bcrypt = require('bcrypt');

(async () => {
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const encryptPasswd = await bcrypt.hash(password, salt);
    
    console.log(encryptPasswd);
})();