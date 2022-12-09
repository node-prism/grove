/// <reference types="node" />
import express from "express";
import { Server as ServerHTTP } from "http";
import { Server as ServerHTTPS } from "http";
import { GroveApp } from "./shared/definitions";
export { GroveApp };
export declare function createApi(appRoot: string, app: express.Express, server: ServerHTTP | ServerHTTPS): Promise<GroveApp>;
