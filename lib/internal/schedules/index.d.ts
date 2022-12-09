import { GroveApp } from "../../shared/definitions";
export { CronInterval } from "./common";
export interface Schedule {
    /** A cron expression. */
    cron: string;
    /** Whether or not to schedule this. */
    scheduled: boolean;
    /** A timezone string, e.g. "America/Los_Angeles". */
    timezone: string;
}
export default function createSchedules(app: GroveApp): Promise<void>;
