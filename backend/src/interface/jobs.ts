import { Cron } from "croner";

export interface ISchedulable {
    name: string;
    disabled?: boolean;
    schedule: string;
    handler(self: Cron): Promise<void>;
    // if true, multiple instance of this job can run at a time
    // otherwise new instance have to wait for existing one to complete
    allowConcurrent?: boolean;
}