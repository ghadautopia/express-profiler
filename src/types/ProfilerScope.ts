import { StreamLog } from "./internals";

export class ProfilerScope {
  constructor(
    public name: string,
    public hasToolbarSlot: boolean,
    public hasPageView: boolean
  ) {}

  async getToolbarSlot(
    streamsData: Map<string, StreamLog[]>
  ): Promise<ToolbarSlotData> {
    return { text: `N/A ${this.name}` };
  }

  async getPageView(
    streamsData: Map<string, StreamLog[]>,
    profilerViewsDir: string
  ): Promise<PageViewData> {
    return { template: `N/A ${this.name}` };
  }

  async getPageTab(
    streamsData: Map<string, StreamLog[]>
  ): Promise<PageTabData> {
    return { title: `N/A ${this.name}` };
  }
}

export interface ToolbarSlotData {
  text: string;
  description?: string;
  svg?: string;
  color?: ProfilerColor;
}

export interface PageViewData {
  template: string;
  styles?: string;
  script?: string;
}

export interface PageTabData {
  svg?: string;
  title: string;
}

export enum ProfilerColor {
  SUCCESS = "green",
  WARNING = "orange",
  DANGER = "darkred",
  ALERT = "skyblue",
  BLACK = "#000",
  WHITE = "#FFF",
  DISABLED = "#B6B6B6",
}
