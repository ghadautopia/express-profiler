import sqlite3Obj, { Database } from "sqlite3";
import path from "path";
import fs from "fs";
import { ProfilerError } from "../types";
import { DbOutput, DbReadFilters, StreamLog } from "../types/internals";
import { stringify } from "../services/json";

const sqlite3 = sqlite3Obj.verbose();
const dbDir = path.join(process.cwd(), ".cache", "ghada");
const dbFile = path.join(dbDir, "profiler.sqlite");
let db: Database;
secureDB();

export const writeToDB = (token: string, stream: string, data: any) => {
  const ivalues = new Map();
  ivalues.set("token", token);
  ivalues.set("stream", stream);
  ivalues.set("time", Date.now());
  ivalues.set("data", stringify(data));

  // it breaks when using STR_REQ_RES
  if (stream === "req-res") {
    ivalues.set("req_start_time", data.req._startTime);
    ivalues.set("res_status_code", data.statusCode);
    ivalues.set("req_method", data.req.method);
    ivalues.set(
      "req_uri",
      `${data.req.protocol}://${data.req.headers.host}${data.req.originalUrl}`
    );
    ivalues.set("res_status_code", data.statusCode);
    ivalues.set("req_remote_address", data.req.remoteAddress);
  }

  const query = `INSERT INTO logs (${[...ivalues.keys()].join(
    ","
  )}) VALUES (${new Array(ivalues.size).fill("?").join(",")})`;

  return new Promise((resolve, reject) => {
    db.serialize(async function () {
      try {
        await secureDB();
        db.prepare(query, function (err) {
          try {
            if (err) {
              throw err;
            }

            this.run([...ivalues.values()]);
            this.finalize();
            resolve("");
          } catch (e) {
            reject(new ProfilerError(`STREAM ${stream}: ${e}`, 500));
          }
        });
      } catch (e) {
        reject(new ProfilerError(`STREAM ${stream}: ${e}`, 500));
      }
    });
  });
};

export const readFromDB = async (
  filters: DbReadFilters = {}
): Promise<DbOutput> => {
  // prepare filters
  const ifilters = new Map();
  if (filters.token) ifilters.set("token LIKE ?", prepareFilter(filters.token));
  if (filters.stream)
    ifilters.set("stream LIKE ?", prepareFilter(filters.stream));
  if (filters.ip)
    ifilters.set("req_remote_address LIKE ?", prepareFilter(filters.ip));
  if (filters.method)
    ifilters.set("req_method LIKE ?", prepareFilter(filters.method));
  if (filters.status)
    ifilters.set("res_status_code LIKE ?", prepareFilter(filters.status));
  if (filters.url) ifilters.set("req_uri LIKE ?", prepareFilter(filters.url));
  if (filters.from)
    ifilters.set(
      "req_start_time >= ?",
      new Date(prepareFilter(filters.from)).getTime()
    );
  if (filters.till) {
    const date = new Date(prepareFilter(filters.till));
    date.setDate(date.getDate() + 1);
    ifilters.set("req_start_time <= ?", date.getTime());
  }

  let query = "SELECT token, stream, time, data FROM logs";
  let queryCount = "";
  let totalItems: number | undefined = undefined;

  if (ifilters.size) {
    query += ` WHERE ${[...ifilters.keys()].join(" AND ")}`;
  }

  // query += ' ORDER BY time DESC';

  if (filters.page && filters.itemsPerPage) {
    queryCount = `SELECT COUNT(*) AS total FROM (${query})`;
    query += ` LIMIT ${(filters.page - 1) * filters.itemsPerPage},${
      filters.itemsPerPage
    }`;
  }

  // DO NOT OMIT
  console.log(`DB QUERY - ${stringify(filters)}:`, query);
  console.log(`DB QUERY COUNT - ${stringify(filters)}:`, queryCount);

  const items = await new Promise<StreamLog[]>((resolve, reject) => {
    db.serialize(async function () {
      await secureDB();

      db.prepare(query, [...ifilters.values()]);
      db.all(query, [...ifilters.values()], function (err, rows) {
        try {
          if (err) {
            throw err;
          }

          const items = rows.map((r) => {
            const { data } = r;
            return {
              ...r,
              data: JSON.parse(data),
            };
          });

          resolve(items);
        } catch (e) {
          reject(new ProfilerError(`DB READ ${stringify(filters)}: ${e}`, 500));
        }
      });
    });
  });

  if (queryCount) {
    totalItems = await new Promise<number>((resolve, reject) => {
      db.serialize(async function () {
        await secureDB();

        db.get(queryCount, [...ifilters.values()], function (err, data) {
          try {
            if (err) {
              throw err;
            }

            resolve(Object.values(data as { ALL: number })[0]);
          } catch (e) {
            reject(
              new ProfilerError(
                `DB READ COUNT ${stringify(filters)}: ${e}`,
                500
              )
            );
          }
        });
      });
    });
  }

  return {
    items,
    pages:
      totalItems && filters.page && filters.itemsPerPage
        ? {
            page: filters.page,
            total: Math.ceil(totalItems / filters.itemsPerPage),
            totalItems: totalItems,
          }
        : undefined,
  };
};

async function secureDB() {
  secureDBFile();
  await initDB();

  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS logs (
            token TEXT NOT NULL,
            stream TEXT NOT NULL,
            time TEXT NOT NULL,
            data BLOB NOT NULL,
            req_start_time TEXT,
            res_status_code TEXT,
            req_method TEXT,
            req_uri TEXT,
            req_remote_address TEXT
        )`,
      function (err) {
        if (err) {
          reject(new ProfilerError(`DB TABLE CREATE: ${err}`, 500));
        }

        resolve("");
      }
    );
  });
}

function prepareFilter(value: string) {
  return `%${decodeURI(value).trim().toUpperCase()}%`;
}

function secureDBFile() {
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "");
}

async function initDB() {
  db = await new Promise<Database>((resolve, reject) => {
    const database = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        reject(new ProfilerError(`DB INIT: ${err}`, 500));
      }

      resolve(database);
    });
  });
}
