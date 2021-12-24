import { Response } from "express";
import { writeToDB } from "../db";
import { getTokenFromRes } from "../services/token";
import { state } from "../state";

export class ProfilerStream {
  constructor(public name: string) {
    state.registerStream(this);
  }

  async presist(res: Response, data: unknown) {
    const token = getTokenFromRes(res);

    writeToDB(token, this.name, data);
  }
}
