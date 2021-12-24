import { ProfilerStream } from "../types/ProfilerStream";

export const createStream = (name: string) => {
  return new ProfilerStream(name);
};
