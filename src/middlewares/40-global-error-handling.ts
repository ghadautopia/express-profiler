import { RequestHandler } from "express";
import onFinished from "on-finished";
import { ProfilerError } from "../types";
import { state } from "../state";
import ejs from "ejs";
import path from "path";
import { inspect } from "util";

export const middleware: RequestHandler = async (req, res, next) => {
  const onError = (error: any, origin: any) => {
    const templateFile = path.join(
      __dirname,
      "..",
      "..",
      "views",
      "error",
      "index.ejs"
    );

    let template = "";
    ejs.renderFile(
      templateFile,
      {
        message: error.toString(),
        state,
        error: inspect(error),
        origin: inspect(origin),
      },
      (err: Error | null, str: string) => {
        if (err) {
          throw new ProfilerError(`ERROR PAGE-VIEW RENDER ERROR: ${err}`, 500);
        }

        template = str;
      }
    );

    return res.status(500).send(template);
  };

  process.on("uncaughtException", onError);
  process.on("unhandledRejection", onError);

  onFinished(res, () => {
    process.removeListener("uncaughtException", onError);
    process.removeListener("unhandledRejection", onError);
  });

  next();
};
