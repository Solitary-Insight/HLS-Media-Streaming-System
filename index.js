import express from 'express';
import cors from 'cors';
import { uploadVideo } from './controllers/Admin.ts';
import { upload } from './middlewares/MulterMiddleware.ts';

const app = express();
const port = 8000;

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
}));

app.use(express.json());

// Video upload route
app.post('/api/upload', upload.single('video'), uploadVideo);

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
