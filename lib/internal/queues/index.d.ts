/// <reference types="node" />
import EventEmitter from "node:events";
import { GroveApp } from "../../shared/definitions";
interface QueueConfig {
    /** When a worker becomes free, it will wait `delay` before working. */
    delay?: string | number;
    /** Number of simultaneous async workers. */
    concurrency?: number;
    /** Once started, a queue task will fail after timeout ms. A value of 0 means the task will never be forcefully timed out. */
    timeout?: string | number;
    /**
     * groups are used to scope this queue to a specific key.
     *
     * @example
     * mailQueue.group(recipient.address).push(sendEmail);
     *
     * The options (delay, concurrency, timeout) are inherited from the queue
     * unless defined here, except for `concurrency` which defaults to 1.
     */
    groups?: {
        delay: string | number;
        concurrency: number;
        timeout?: string | number;
        /**
         * The period of inactivity duration that, when reached, partitions will destroy themselves.
         * Accepts a {@link duration}.
         * */
        expiration?: string | number;
    };
}
export declare function createQueues(app: GroveApp): Promise<void>;
export default class Queue<Payload> extends EventEmitter {
    readonly config: QueueConfig;
    readonly delay_ms: number;
    readonly timeout_ms: number;
    readonly concurrency: number;
    readonly emitter: EventEmitter;
    readonly bucketQueue: Array<Array<{
        uuid: string;
        payload: any;
        callback?: Function;
    }>>;
    /** Number of tasks currently being executed. */
    private inflight;
    /** Number of tasks currently in the queue and awaiting completion. */
    private size;
    /** Independent queues limited to 1 concurrent task. */
    private groups;
    /** Inactivity duration before group queue self-destruction. */
    private expiration;
    private expirationInterval;
    private shouldExpire;
    private isGroup;
    /** If this is a group, parentQueue is the queue that spawned it. */
    private parentQueue;
    private timeouts;
    executor: Function;
    constructor(config: QueueConfig);
    cycle(): void;
    private startExpirationTimer;
    private processTasks;
    createTimeoutPromise(uuid: string): Promise<unknown>;
    /**
     * Push a task to the queue.
     * `0` is the highest priority value.
     * If no priority is supplied, it's priority is equal to
     * the length of the current bucketQueue, giving it the lowest
     * possible priority.
     */
    push(payload: Payload, { callback, priority }?: {
        callback?: () => void;
        priority?: number;
    }): string;
    /**
     * A group returns a new Queue or existing Queue
     * that relates to the given name. They are short living
     * and expire after 5s.
     */
    group(name: string): Queue<Payload>;
}
export {};
