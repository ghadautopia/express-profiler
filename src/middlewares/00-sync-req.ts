import { RequestHandler } from "express";
import onFinished from "on-finished";

let processingRequest = false;

export const middleware: RequestHandler = async (req, res, next) => {
  await waiting();
  processingRequest = true;

  onFinished(res, () => {
    processingRequest = false;
  });

  next();
};

async function waiting() {
  return new Promise((resolve) => {
    if (processingRequest) {
      setTimeout(() => {
        waiting();
      }, 1000); // wait 1 sec
    } else {
      resolve("");
    }
  });
}
