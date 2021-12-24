import { STR_REQ_RES } from "../streams/req-res-stream";
import { ProfilerColor } from "../types/ProfilerScope";
import { StreamLog } from "../types/internals";
import ejs from "ejs";
import path from "path";
import { ProfilerError } from "../types";
import { createScope } from "../services/scope";
import { ToolbarSlotData } from "../types/ProfilerScope";

export const reqResScope = createScope({
  name: "req-res",
  getToolbarSlot: async (streamsData: Map<string, StreamLog[]>) => {
    const reqResStream = streamsData.get(STR_REQ_RES);

    const result: ToolbarSlotData = {
      text: "N/A",
      description: "Response status code",
    };

    if (!reqResStream) return result;

    const data = reqResStream[0].data.statusCode;

    let color = ProfilerColor.SUCCESS;

    if (data > 499) {
      color = ProfilerColor.DANGER;
    } else if (data > 399) {
      color = ProfilerColor.WARNING;
    } else if (data > 299) {
      color = ProfilerColor.ALERT;
    }

    result.text = data.toString();
    result.color = color;

    return result;
  },
  getPageTab: async (streamsData: Map<string, StreamLog[]>) => {
    return {
      title: "Request/Response",
      svg: '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 2c5.519 0 10 4.481 10 10s-4.481 10-10 10-10-4.481-10-10 4.481-10 10-10zm2 12v-3l5 4-5 4v-3h-9v-2h9zm-4-6v-3l-5 4 5 4v-3h9v-2h-9z"/></svg>',
    };
  },
  getPageView: async (streamsData: Map<string, StreamLog[]>) => {
    const templateFile = path.join(
      __dirname,
      "..",
      "..",
      "views",
      "pageviews",
      "req-res",
      "index.ejs"
    );

    let template = "";
    const streamData = streamsData.get(STR_REQ_RES);
    const locals = streamData && streamData[0];

    ejs.renderFile(
      templateFile,
      { locals },
      (err: Error | null, str: string) => {
        if (err) {
          throw new ProfilerError(`PAGE-VIEW RENDER ERROR: ${err}`, 500);
        }

        template = str;
      }
    );

    return {
      template,
    };
  },
});
