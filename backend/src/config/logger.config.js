import path from "node:path";
import fs from "node:fs";
import { createStream } from "rotating-file-stream";

const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
fs.mkdirSync(logDirectory);
}

export const accessLogStream = createStream("access.log", {
interval: "1d",
path: logDirectory,
maxFiles: 14,
size: "10M",
});

export const errorLogStream = createStream("error.log", {
interval: "1d",
path: logDirectory,
maxFiles: 30,
size: "10M",
});