import * as express from 'express';
import * as bodyParser from "body-parser";
import {Base64} from 'js-base64';
import execTrans from '../public/db-helper';
const port = 3333;
const receivePort = 2712;
const app = express();
app.use(bodyParser.json());
app.listen(port);
console.log(`sever started at localhost:${port}, receive port is ${receivePort}`);

const router = express.Router();
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:' + receivePort);
    res.header('Access-Control-Allow-Header', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Powered-By', '3.2.1');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
        res.send(200);
    } else {
        next();
    }
});
app.use('', router);
router.route('**').post((req, res) => {
    execTrans(req.body.s.map(s => Base64.decode(s)), res);
});
