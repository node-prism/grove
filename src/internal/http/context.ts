import { NextFunction, Request, Response } from "express";

export default class Context {
  constructor(public req: Request, public res: Response, public next: NextFunction) {}
}
