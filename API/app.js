require('dotenv').config();
const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const indexRoute = require('./routes/index');
const searchRoute = require('./routes/search');
const mediaRoute = require('./routes/media');
const adminRoute = require('./routes/admin');
const ordersRoute = require('./routes/orders');
const catalogRoute = require('./routes/catalog');

const { checkLogin } = require('./middleware/verify');  // 解构导入，因为 middleware/verify 有两个方法，结构后导出了。

// 通用导入
const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', indexRoute);
app.use('/search', searchRoute);
app.use('/media', mediaRoute);
app.use('/admin', adminRoute);
app.use('/orders', ordersRoute);
app.use('/catalog', catalogRoute);

app.listen(PORT, () => {
    console.log(`服务已经启动到 http://localhost:${PORT}`);
});
