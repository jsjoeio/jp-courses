import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
import {
  bold,
  cyan,
  green,
  red,
  yellow,
} from "https://deno.land/std@0.95.0/fmt/colors.ts";

import {
  Application,
  HttpError,
  Status,
} from "https://deno.land/x/oak@v7.1.0/mod.ts";
import { extname } from "https://deno.land/std@0.95.0/path/mod.ts";
// Source: https://github.com/thecodeholic/deno-serve-static-files/blob/final-version/http-server/server.ts#L19-L35
export async function startCourseServer(PORT = 8000) {
  await app.listen({ hostname: "127.0.0.1", port: PORT });
  // TODO listen for keypress
  // https://deno.land/x/keypress@0.0.4
}
//////////////////////////////////
//////////////////////////////////
// Server Functions
//////////////////////////////////
//////////////////////////////////

const app = new Application();

// Error handler middleware
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      // deno-lint-ignore no-explicit-any
      context.response.status = e.status as any;
      if (e.expose) {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${e.message}</h1>
              </body>
            </html>`;
      } else {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${Status[e.status]}</h1>
              </body>
            </html>`;
      }
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>500 - Internal Server Error</h1>
              </body>
            </html>`;
      console.log("Unhandled Error:", red(bold(e.message)));
      console.log(e.stack);
    }
  }
});

// Logger
app.use(async (context, next) => {
  await next();
  const rt = context.response.headers.get("X-Response-Time");
  console.log(
    `${green(context.request.method)} ${
      cyan(
        context.request.url.pathname,
      )
    } - ${bold(String(rt))}`,
  );
});

// Response Time
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  context.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Send static content
app.use(async (context) => {
  const root = `${Deno.cwd()}/examples/static`;
  const requestPath = context.request.url.pathname;
  const path = await handleFileToServe(requestPath, root);

  await context.send({
    root,
    path,
    index: "index.html",
  });
});

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(`🚀 Starting course on ${green(`${hostname}:${port}`)}`);
  console.log(bold("  using HTTP server: " + yellow(serverType)));
  console.log(``);
  // TODO listen for keypress
  // https://deno.land/x/keypress@0.0.4
  console.log(
    `⌨️ To stop course, hit ${yellow(`Control + C`)} on your keyboard.`,
  );
});

//////////////////////////////////
//////////////////////////////////
// Helper Functions
//////////////////////////////////
//////////////////////////////////

export function getParentDir(path: string) {
  // /Users/jp/Dev/testing/oak-server/examples/static/course
  // Source: https://stackoverflow.com/a/16863827/3015595
  return path.substring(0, path.lastIndexOf("/"));
}

export async function isDirectory(path: string) {
  try {
    const fileInfo = await Deno.stat(path);
    return fileInfo.isDirectory;
  } catch (error) {
    console.error(error, "something went wrong checking if isDirectory");
  }
}

export async function hasHtmlFileForDir(fileName: string, parentDir: string) {
  let hasHtmlFile = false;
  // Source: https://deno.land/std@0.95.0/http/file_server.ts#L167
  for await (const entry of Deno.readDir(parentDir)) {
    if (entry.name === `${fileName}.html` && entry.isFile) {
      hasHtmlFile = true;
      break;
    }
  }
  return hasHtmlFile;
}

export async function handleFileToServe(path: string, root: string) {
  if (path === "/") {
    return `index.html`;
  }

  const fileExt = extname(path);
  const fullFilePath = `${root}${path}`;

  if (fileExt === "" && (await isDirectory(fullFilePath))) {
    // TODO this only looks one level deep
    const fileName = path.substr(1);
    const parentDir = getParentDir(fullFilePath);
    const hasHtmlFile = await hasHtmlFileForDir(fileName, parentDir);
    if (hasHtmlFile) {
      return `${path}.html`;
    }
  }

  return path;
}

// TODO add the rest of the oak server code in
// everything that isn't part of the helper functions
