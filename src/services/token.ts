import { Response } from "express";
import { state } from "../state";
import { ProfilerError } from "../types";

export const getTokenFromRes = (res: Response) => {
  const token = res.getHeader(state.profilerTokenKey) as string;

  if (!token) {
    throw new ProfilerError("token not found", 400);
  }

  return token;
};

export const getTokenLinkFromRes = (res: Response) => {
  const tokenLink = res.getHeader(state.profilerLinkKey) as string;

  if (!tokenLink) {
    throw new ProfilerError("token link not found", 400);
  }

  return tokenLink;
};
