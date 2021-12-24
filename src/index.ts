import express, { Express } from "express";
import { ProfilerConfig, ProfilerError } from "./types";
import { state } from "./state";
import router from "./routes";
import path from "path";
import { reqResScope } from "./scopes/req-res-scope";

// middlewares
import responseTime from "response-time";
import { middleware as syncReqMw } from "./middlewares/00-sync-req";
import { middleware as noCacheReqMw } from "./middlewares/10-no-cache-req";
import { middleware as tokenizeResMw } from "./middlewares/20-tokenize-res";
import { middleware as reqResMw } from "./middlewares/30-req-res-stream";
import { middleware as globalErrorHandlingMw } from "./middlewares/40-global-error-handling";

const profiler = (app: Express, config?: ProfilerConfig) => {
  if (!app) {
    throw new ProfilerError("app not provided", 500);
  }

  const profilerApp = express();

  state.rootRoute =
    (config?.rootRoute && `/${config.rootRoute.replace(/^\/+/, "")}`) ||
    state.rootRoute;
  state.debugRoute =
    (config?.debugRoute && `/${config.debugRoute.replace(/^\/+/, "")}`) ||
    state.debugRoute;
  const scopes = [reqResScope, ...(config?.scopes || [])];

  // view engine setup
  profilerApp.set("views", path.join(__dirname, "..", "views"));
  profilerApp.set("view engine", "ejs");
  profilerApp.use(express.static(path.join(__dirname, "assets")));
  profilerApp.use(express.static(path.join(__dirname, "..", "public")));

  // register scopes
  scopes.forEach((scope) => state.registerScope(scope));

  // register profiler routes
  profilerApp.use(router);

  // register debug prefix for app routes
  app.use(
    state.debugRoute,
    syncReqMw,
    ...(config?.enableCache ? [] : [noCacheReqMw]),
    tokenizeResMw,
    responseTime({ suffix: false }),
    reqResMw,
    ...(config?.streamMiddlewares || []),
    globalErrorHandlingMw,
    (req, res, next) => app._router.handle(req, res, next)
  );

  app.use(state.rootRoute, profilerApp);

  return app;
};

export * from "./services";
export * from "./types";
export { profiler };
