/** Retry only a read after a dropped database connection; never replay a mutation. */
export async function readWithConnectionRetry<T>(read: () => Promise<T>): Promise<T> {
  try { return await read(); }
  catch (error) {
    const e = error as { code?: string; errorCode?: string } | null;
    if (!e || !["P1001", "P1017"].includes(e.code || e.errorCode || "")) throw error;
    await new Promise(resolve => setTimeout(resolve, 100));
    return read();
  }
}
