import { RequestHandler, Response } from "express";
import { toolbarInjectionScript } from "../services/toolbar";
import { getTokenLinkFromRes, getTokenFromRes } from "../services/token";
import { reqResStream, transformData } from "../streams/req-res-stream";
import type { ServerResponseChunk } from "../types/internals";
import onFinished from "on-finished";

export const middleware: RequestHandler = (req, res, next) => {
  const tokenLink = getTokenLinkFromRes(res);
  const token = getTokenFromRes(res);

  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks: ServerResponseChunk[] = [];

  res.write = function (chunk, ...args) {
    chunks.push(chunk);

    // consider toolbar injection script while writing chunk
    return oldWrite.apply(res, [
      toolbarInjectionScript(res, chunk, token, tokenLink),
      // @ts-ignore
      ...args,
    ]);
  };

  // @ts-ignore
  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(chunk);

    const resBody = Buffer.concat(
      chunks.map((x) => {
        return typeof x === "string" ? Buffer.from(x, "binary") : x;
      })
    ).toString("utf8");

    (res as Response & { body: unknown }).body = resBody;

    onFinished(res, () => {
      reqResStream.presist(res, transformData(res));
    });

    // consider toolbar injection script while writing chunk
    oldEnd.apply(res, [
      toolbarInjectionScript(res, chunk, token, tokenLink),
      // @ts-ignore
      ...args,
    ]);
  };

  next();
};
