import { ProfilerScope } from "../types/ProfilerScope";
import { StreamLog } from "../types/internals";
import {
  ToolbarSlotData,
  PageViewData,
  PageTabData,
} from "../types/ProfilerScope";
import { ProfilerError } from "../types";

export const createScope = ({
  name,
  getToolbarSlot,
  getPageTab,
  getPageView,
}: {
  name: string;
  getToolbarSlot?: (
    streamsData: Map<string, StreamLog[]>
  ) => Promise<ToolbarSlotData>;
  getPageTab?: (
    streamsData: Map<string, StreamLog[]>
  ) => Promise<PageTabData>;
  getPageView?: (
    streamsData: Map<string, StreamLog[]>,
    profilerViewsDir: string
  ) => Promise<PageViewData>;
}) => {
  const profileScope = new ProfilerScope(
    name,
    !!getToolbarSlot,
    !!(getPageTab && getPageView)
  );

  if (getToolbarSlot) {
    profileScope.getToolbarSlot = getToolbarSlot;
  }

  if (getPageTab && !getPageView) {
    throw new ProfilerError(
      `SCOPE ${name}: getPageView should be defined with getPageTap`,
      500
    );
  }

  if (!getPageTab && getPageView) {
    throw new ProfilerError(
      `SCOPE ${name}: getPageTap should be defined with getPageView`,
      500
    );
  }

  if (getPageTab && getPageView) {
    profileScope.getPageTab = getPageTab;
    profileScope.getPageView = getPageView;
  }

  return profileScope;
};
