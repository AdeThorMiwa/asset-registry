import { Container, Token } from "typedi";
import { ISchedulable } from "../interface/jobs";
import Logger from "../utils/logger";
import { Cron } from "croner";
import { JOB_TOKEN } from "../constants/tokens";

class JobScheduler {
    private jobs: ISchedulable[];

    constructor() {
        this.jobs = Container.getMany(JOB_TOKEN);
    }

    public async startAllJobs() {
        Logger.info('Starting all registered jobs...');
        await Promise.all(this.jobs.map(job => {
            if (job.disabled) {
                Logger.warn("[JobScheduler] job %s is disabled. Skipping scheduling", job.name);
                return;
            }

            // @todo enforce concurrency 
            const scheduledJob = new Cron(
                job.schedule,
                { name: job.name, protect: job.allowConcurrent ?? false },
                job.handler.bind(job)
            )

            Logger.debug(`[JobScheduler] job ${scheduledJob.name} next scheduled for ${scheduledJob.nextRun()}`)
        }));

        Logger.info('All jobs have been started.');
    }
}

export * from "./LogReader"

export default new JobScheduler();