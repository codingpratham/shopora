import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import indexRoutes from './routes/index.routes.js';
import cors from 'cors';

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())
app.use('api/v1', indexRoutes)

app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ message: 'Server is healthy' });
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})