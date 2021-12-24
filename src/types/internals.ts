import { ToolbarSlotData } from "./ProfilerScope";

export type ServerResponseChunk = Buffer | string;

export interface ToolbarSlotDTO extends ToolbarSlotData {
  name: string;
}

export interface StreamLog {
  token: string;
  stream: string;
  time: string;
  data: any;
}

export interface DbOutput {
  items: StreamLog[];
  pages?: {
    page: number;
    total: number;
    totalItems: number;
  };
}

export type DbReadFilters = {
  token?: string;
  stream?: string;
  ip?: string;
  method?: string;
  status?: string;
  url?: string;
  from?: string;
  till?: string;
} & (
  | {
      page?: never;
      itemsPerPage?: never;
    }
  | {
      page: number;
      itemsPerPage: number;
    }
);
