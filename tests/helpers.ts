// Testing utilities
export async function createTmpDir(prefix: string) {
  return await Deno.makeTempDir({ prefix });
}

export async function cleanUpTmpDir(tmpDirPath: string) {
  const tmpDirPathAsFile = await Deno.open(tmpDirPath);

  Deno.close(tmpDirPathAsFile.rid);
  await Deno.remove(tmpDirPath, { recursive: true });
}
