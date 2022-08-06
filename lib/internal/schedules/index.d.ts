import { PrismApp } from "../../shared/definitions";
export { CRON } from "./common";
export interface Schedule {
    /** A cron expression. */
    cron: string;
    /** Whether or not to schedule this. */
    scheduled: boolean;
    /** A timezone string, e.g. "America/Los_Angeles". */
    timezone: string;
}
export default function createSchedules(app: PrismApp): Promise<void>;
