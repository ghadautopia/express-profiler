import { Response } from "express";
import { state } from "../state";
import { ServerResponseChunk } from "../types/internals";

const getInjected = (token: string, tokenLink: string) => {
  return `<script src="${state.rootRoute}/toolbar.js" 
  data-token-link="${tokenLink}"
  data-token="${token}"
  data-data-route="${state.rootRoute}/ajax/toolbar?_token=${token}"
  ></script>`;
};

export function toolbarInjectionScript(
  res: Response,
  chunk: Buffer,
  token: string,
  tokenLink: string
) {
  const ctype = res.getHeader("Content-Type") as string | undefined;

  if (!ctype?.startsWith("text/html")) {
    return chunk;
  }

  const main = stringifyChunk(chunk);

  if (!main.includes("</body>")) {
    return chunk;
  }

  const injected = getInjected(token, tokenLink);

  res.setHeader(
    "content-length",
    +(res.getHeader("content-length") || 0) + injected.length
  );

  const chunks = main.split("</body>");
  chunks.splice(1, 0, injected, "</body>");
  return Buffer.concat(chunks.map((ch) => destringifyChunk(ch)));
}

function stringifyChunk(chunk: ServerResponseChunk) {
  return typeof chunk === "string"
    ? chunk
    : Buffer.from(chunk).toString("utf8");
}

function destringifyChunk(chunk: ServerResponseChunk) {
  return typeof chunk === "string" ? Buffer.from(chunk, "binary") : chunk;
}
