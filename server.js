require('dotenv').config();
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const Pusher = require('pusher');
app.use(bodyParser.json());

const port = process.env.PORT || 4000;
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap3',
});

app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// app.post('/paint', (req, res) => {
//     pusher.trigger('painting', 'draw', req.body);
//     res.json(req.body);
// });

app.router.listen('/payments/complete', async (req, res) => {
    try {

        console.log('CHECKCCC',req.body)
        const {imp_uid, merchant_uid} = req.body; // req의 body에서 imp_uid, merchant_uid 추출

        const amountToBePaid = 100; // 결제 되어야 하는 금액

        // 결제 검증하기
        const {amount, status} = paymentData;
        if (amount === amountToBePaid) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
        } else { // 결제 금액 불일치. 위/변조 된 결제
            throw {status: "forgery", message: "위조된 결제시도"};
        }
    } catch (e) {
        res.status(400).send(e);
    }
});
