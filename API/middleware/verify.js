const { verifyToken } = require('../auth/jwt');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.cookies?.authToken;

    if (!token) {
        console.warn('verifyAdmin: 未找到认证令牌。');
        return res.status(404).send('Page Not Found');
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded || !decoded.role) {
            console.warn('verifyAdmin: 令牌无效或用户无管理员权限 (role: false)。', decoded);
            return res.status(404).send('Page Not Found');
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('verifyAdmin: Token 验证失败:', error.message);
        return res.status(404).send('Page Not Found');
    }
};

const checkLogin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.cookies?.authToken;
        
    if (!token) {
        return next();
    }

    try {
        const decoded = verifyToken(token)
        if (!decoded || !decoded.role) {
            return next();
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.log('认证错误:', error.message);
        next();
    }
};

module.exports = { verifyAdmin, checkLogin };