/**
 * Dev-only SMTP sink: a minimal SMTP state machine on a Bun TCP listener.
 * It accepts every message and writes the raw bytes to a directory, one .eml
 * file per message — used by the verification pass and handy for local
 * development:
 *
 *   bun packages/waitlist/src/server/dev/smtp-sink.ts [port] [directory]
 *
 * It is not a mail server: no TLS, no auth, no relaying; it accepts everything
 * and stores it. Defaults: port 2525, directory $TMPDIR/smtp-sink.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Socket } from "bun";

interface SinkState {
  mode: "command" | "data";
  buffer: string;
  decoder: TextDecoder;
  from: string;
  to: string[];
  received: number;
}

function extractAddress(line: string): string {
  const bracketed = /<([^>]*)>/.exec(line);
  return bracketed?.[1] ?? line.split(":").slice(1).join(":").trim();
}

/** True when the command was handled; false when the session entered DATA mode. */
function handleCommand(socket: Socket<SinkState>, state: SinkState, line: string): boolean {
  const upper = line.trim().toUpperCase();
  if (upper === "DATA") {
    socket.write("354 end data with <CR><LF>.<CR><LF>\r\n");
    state.mode = "data";
    return false;
  }
  if (upper.startsWith("EHLO")) {
    socket.write("250-smtp-sink greets you\r\n250-8BITMIME\r\n250 OK\r\n");
  } else if (upper.startsWith("HELO")) {
    socket.write("250 smtp-sink greets you\r\n");
  } else if (upper.startsWith("MAIL FROM:")) {
    state.from = extractAddress(line.trim().slice(10));
    state.to = [];
    socket.write("250 OK\r\n");
  } else if (upper.startsWith("RCPT TO:")) {
    state.to.push(extractAddress(line.trim().slice(8)));
    socket.write("250 OK\r\n");
  } else if (upper === "RSET") {
    state.from = "";
    state.to = [];
    socket.write("250 OK\r\n");
  } else if (upper === "NOOP") {
    socket.write("250 OK\r\n");
  } else if (upper === "QUIT") {
    socket.write("221 smtp-sink closing\r\n");
    socket.end();
  } else if (upper === "") {
    socket.write("250 OK\r\n");
  } else {
    socket.write("500 unrecognized command\r\n");
  }
  return true;
}

/** Undo the dot-stuffing the client applied to leading dots. */
function unstuff(raw: string): string {
  return raw.replace(/(^|\r\n)\.\./g, "$1.");
}

function deliver(state: SinkState, raw: string, dir: string): string {
  state.received += 1;
  const name = `${String(state.received).padStart(4, "0")}-${Date.now()}.eml`;
  const path = join(dir, name);
  writeFileSync(path, unstuff(raw), "utf8");
  console.log(`[sink] #${state.received} from=${state.from || "?"} to=${state.to.join(",") || "?"} -> ${path}`);
  return path;
}

function main(): void {
  const port = Number(process.argv[2] ?? process.env.SINK_PORT ?? 2525);
  const dir = process.argv[3] ?? process.env.SINK_DIR ?? join(tmpdir(), "smtp-sink");
  mkdirSync(dir, { recursive: true });

  const server = Bun.listen<SinkState>({
    hostname: "127.0.0.1",
    port,
    socket: {
      open(socket) {
        socket.data = { mode: "command", buffer: "", decoder: new TextDecoder("utf-8"), from: "", to: [], received: 0 };
        socket.write("220 smtp-sink ready\r\n");
      },
      data(socket, chunk) {
        const state = socket.data;
        state.buffer += state.decoder.decode(chunk, { stream: true });

        if (state.mode === "command") {
          for (;;) {
            const end = state.buffer.indexOf("\r\n");
            if (end === -1) break;
            const line = state.buffer.slice(0, end);
            state.buffer = state.buffer.slice(end + 2);
            if (!handleCommand(socket, state, line)) break;
          }
        }

        if (state.mode === "data") {
          for (;;) {
            const end = state.buffer.indexOf("\r\n.\r\n");
            if (end === -1) break;
            const message = state.buffer.slice(0, end);
            state.buffer = state.buffer.slice(end + 5);
            deliver(state, message, dir);
            state.mode = "command";
            socket.write("250 OK queued\r\n");
          }
        }
      },
      close() {},
      error(socket, error) {
        console.error(`[sink] connection error: ${error instanceof Error ? error.message : String(error)}`);
        socket.end();
      },
    },
  });

  console.log(`[sink] smtp sink listening on ${server.hostname}:${server.port}, writing to ${dir}`);
}

if (import.meta.main) main();
