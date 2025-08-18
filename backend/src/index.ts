import 'reflect-metadata';
import app from './app';
import Logger from './utils/logger';
import { Env } from './config/env';
import ErrorHandler from './utils/error';
import { Container } from 'typedi';
import { BlockIndexer } from './services/BlockIndexer';
import JobScheduler from './jobs';

// Start Server
const server = app.listen(Env.PORT, () =>
    Logger.info(`[server]: Server is running on PORT ${Env.PORT}`),
);

// Start Indexer
const indexer = Container.get<BlockIndexer>(BlockIndexer);
indexer.start.bind(indexer)();

// Start Job Scheduler
JobScheduler.startAllJobs();

ErrorHandler.handleServerError(async () => {
    await new Promise((res) => {
        server.close(() => res(0))
    });
    indexer.stop();
});

