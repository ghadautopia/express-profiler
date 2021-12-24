import { ProfilerScope } from "./ProfilerScope";
import { RequestHandler } from "express";

export interface ProfilerConfig {
  rootRoute?: string;
  debugRoute?: string;
  scopes?: ProfilerScope[];
  streamMiddlewares?: RequestHandler[];
  enableCache?: boolean;
}

export class ProfilerError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export {
  ToolbarSlotData,
  PageViewData,
  PageTabData,
  ProfilerColor,
} from "./ProfilerScope";
