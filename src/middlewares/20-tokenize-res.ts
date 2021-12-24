import { RequestHandler } from "express";
import { state } from "../state";
import { v4 as uuidv4 } from "uuid";

export const middleware: RequestHandler = (req, res, next) => {
  const token = uuidv4();

  res.setHeader(state.profilerTokenKey, token);
  res.setHeader(
    state.profilerLinkKey,
    `${req.protocol}://${req.get("host")}${state.getProfilerTokenRoute(token)}`
  );

  next();
};
