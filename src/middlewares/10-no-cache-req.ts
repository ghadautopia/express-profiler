import { RequestHandler } from "express";

export const middleware: RequestHandler = (req, res, next) => {
  const { headers } = req;

  headers["cache-control"] = "no-cache";

  next();
};
