import express from 'express';
import type { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import RouteManager from './routes';
import DatabaseService from './services/DatabaseService';
import ErrorHandler from './utils/error';

// Connect to DB
DatabaseService.connect();

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(cors());

/** Routes go here */
RouteManager.setupRoutes(app);

app.use(ErrorHandler.httpMiddleware);

export default app;