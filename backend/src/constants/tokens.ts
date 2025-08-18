import { Token } from "typedi";
import { ISchedulable } from "../interface/jobs";
import { IWriter } from "../utils/analytic_writer";

export const JOB_TOKEN = new Token<ISchedulable>('jobs.token');
export const ANALYTICS_WRITER_TOKEN = new Token<IWriter>('analytics.writer.token');