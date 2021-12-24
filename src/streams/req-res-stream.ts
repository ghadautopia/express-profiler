import { Request, Response } from "express";
import { ProfilerStream } from "../types/ProfilerStream";

export const STR_REQ_RES = "req-res";

export const transformData = (res: Response) => {
  const {
    req: {
      httpVersionMajor,
      httpVersionMinor,
      httpVersion,
      headers,
      rawHeaders,
      trailers,
      rawTrailers,
      aborted,
      protocol,
      url,
      method,
      statusCode,
      statusMessage,
      baseUrl,
      originalUrl,
      params,
      query,
      _startAt,
      _startTime,
      body,
      cookies,
      signedCookies,
      route,
    },
    body: bodyRes,
    locals,
    _startAt: _startAtResp,
    _startTime: _startTimeResp,
    __onFinished: __onFinishedResp,
    write,
    end,
    type,
    statusCode: statusCodeResp,
    status: statusResp,
    statusMessage: statusMessageResp,
  } = res as Response & {
    body: unknown;
    _startAt: [number, number];
    _startTime: string;
    __onFinished: unknown;
    req: Request & { _startAt: [number, number]; _startTime: string };
  };
  return {
    locals,
    write,
    end,
    type,
    status: statusResp,
    statusMessage: statusMessageResp,
    statusCode: statusCodeResp,
    headers: res.getHeaders(),
    body: bodyRes,
    _startAt: _startAtResp,
    _startTime: _startTimeResp,
    __onFinished: __onFinishedResp,
    req: {
      remoteAddress: res.req.socket.remoteAddress,
      remoteFamily: res.req.socket.remoteFamily,
      remotePort: res.req.socket.remotePort,
      localAddress: res.req.socket.localAddress,
      localPort: res.req.socket.localPort,
      httpVersionMajor,
      httpVersionMinor,
      httpVersion,
      headers,
      rawHeaders,
      trailers,
      rawTrailers,
      protocol,
      aborted,
      url,
      method,
      statusCode,
      statusMessage,
      baseUrl,
      originalUrl,
      params,
      query,
      _startAt,
      _startTime,
      body,
      cookies,
      signedCookies,
      route,
    },
  };
};

export const reqResStream = new ProfilerStream(STR_REQ_RES);
