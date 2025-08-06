import path from "path"
import dotenv from "dotenv"
dotenv.config({path : path.resolve("src/config/.env")})
import express from 'express';
import bootstrap from './src/app.controller.js';
const app = express();
const PORT = process.env.PORT;


    bootstrap(app, express);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
    