import express from "express";
import { Server as ServerHTTP, Server as ServerHTTPS } from "http";
import { WebSocketServer } from "ws";
import { Context } from "../internal/http";
import Queue from "../internal/queues";
import { SocketMiddleware, WebSocketTokenServer } from "../internal/ws/server";


type Method = {
  (c: Context): any;
  middleware?: Function;
};

export interface PrismApp {
  app: express.Application;
  server: ServerHTTP | ServerHTTPS;
  root: string;
  wss: WebSocketServer & WebSocketTokenServer;
}

export interface HTTPModuleExports {
  default?: Function;

  get?: Method;
  post?: Method;
  put?: Method;
  patch?: Method;
  del?: Method;

  middleware?: Function[];
}

export interface SocketModuleExports {
  default?: SocketMiddleware;
  middleware?: SocketMiddleware[];
}

export interface RouteDefinition {
  route: string;
  filename: string;
}

export interface QueueModuleExports {
  default: Function;
  queue: Queue<any>;
}

export interface ScheduleModuleExports {
  default: Function;
  config: {
    cron: string;
    scheduled: boolean;
    timezone: string;
  };
}

