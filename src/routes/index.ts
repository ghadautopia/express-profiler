import express from "express";
import { state } from "../state";
import { readFromDB } from "../db";
import {
  ToolbarSlotData,
  ProfilerScope,
  PageTabData,
} from "../types/ProfilerScope";
import { ProfilerError } from "../types";
import type { DbOutput, ToolbarSlotDTO } from "../types/internals";
import { reqResStream } from "../streams/req-res-stream";
import { reqResScope } from "../scopes/req-res-scope";
import fs from "fs";
import path from "path";

const router = express.Router();

// profiler route
router.get("/", async (req, res) => {
  const page = +(req.query.page || 1);
  const itemsPerPage = +(req.query.itemsPerPage || 50);

  const { items, pages } = await readFromDB({
    ...req.query,
    page,
    itemsPerPage,
    stream: reqResStream.name,
  });
  return res.render("index/index", {
    state,
    items,
    pages,
    query: req.query,
    page,
    itemsPerPage,
  });
});

// profiler tokenized routes
router.get("/token/:token/:scope?", async (req, res) => {
  const { token } = req.params;
  const scope = req.params.scope || reqResScope.name;

  let currScope: ProfilerScope = state.scopes[0];
  const tabsPromises: Map<string, Promise<PageTabData>> = new Map();
  const dbOutput = await readFromDB({ token });

  const streamsData = await transformDBOutputToStreamsData(dbOutput);

  state.scopes.forEach((scp) => {
    if (!scp.hasPageView) return;
    tabsPromises.set(scp.name, scp.getPageTab(streamsData));

    if (scp.name == scope) currScope = scp;
  });

  // get taps
  const tabsData = await Promise.allSettled(tabsPromises.values()).then(
    (data) => {
      return data
        .map((el, index) => {
          if (el.status === "fulfilled") {
            return {
              ...el.value,
              name: [...tabsPromises.keys()][index],
            };
          }
        })
        .filter((el) => el);
    }
  );

  // get page view
  const profilerViewsDir = path.resolve(
    process.cwd(),
    "node_modules",
    "@ghadautopia",
    "express-profiler",
    "views"
  );
  const pageView = await currScope.getPageView(streamsData, profilerViewsDir);
  const styles = fs.readFileSync(
    path.join(__dirname, "..", "assets", "pageviews.css"),
    "ascii"
  );
  const script = fs.readFileSync(
    path.join(__dirname, "..", "assets", "pageviews.js"),
    "ascii"
  );

  return res.render("scopes/index", {
    state,
    reqRes:
      streamsData.get(reqResStream.name) &&
      streamsData.get(reqResStream.name)[0],
    token,
    scopeName: scope,
    tabsData,
    pageView,
    defaults: {
      styles,
      script,
    },
  });
});

// toolbar ajax route (fetchers are triggered here)
router.get("/ajax/toolbar", async (req, res) => {
  const token = req.query._token as string;

  if (!token) {
    throw new ProfilerError("_token not provided", 400);
  }

  const promises: Promise<ToolbarSlotData>[] = [];

  const dbOutput = (await readFromDB({ token })) || { items: [] };

  const streamsData = await transformDBOutputToStreamsData(dbOutput);

  state.scopes.forEach((scope) => {
    if (!scope.hasToolbarSlot) return;
    promises.push(scope.getToolbarSlot(streamsData));
  });

  Promise.allSettled(promises).then((data) => {
    return res.json(
      data
        .map((el, index) => {
          if (el.status === "fulfilled") {
            return {
              ...el.value,
              name: state.scopes[index].hasPageView
                ? state.scopes[index].name
                : reqResScope.name,
            } as ToolbarSlotDTO;
          } else {
            console.error(
              `TOOLBAR SLOT ERROR - ${state.scopes[index].name}: ${el.reason}`
            );
            return res
              .status(500)
              .json(
                `TOOLBAR SLOT ERROR - ${state.scopes[index].name}: ${el.reason}`
              );
          }
        })
        .filter((el) => el)
    );
  });
});

async function transformDBOutputToStreamsData(dbOutput: DbOutput) {
  const streamsData = new Map();

  dbOutput.items.forEach((data) => {
    const curr = streamsData.get(data.stream) || [];
    streamsData.set(data.stream, [...curr, data]);
  });

  return streamsData;
}

export default router;
