import test from "node:test";
import assert from "node:assert/strict";
import { readWithConnectionRetry } from "../lib/research/retry";
test("read retries one dropped database connection, preserving the recovered data", async () => {
  let calls=0;
  const result=await readWithConnectionRetry(async()=>{if(++calls===1)throw {errorCode:"P1001"};return {positions:["preserved"]};});
  assert.equal(calls,2);assert.deepEqual(result,{positions:["preserved"]});
});
test("read retries neither authorization/validation errors nor indefinitely", async()=>{
  let calls=0;
  await assert.rejects(readWithConnectionRetry(async()=>{calls++;throw new Error("Authentification requise");}),/Authentification/);assert.equal(calls,1);
  calls=0;
  await assert.rejects(readWithConnectionRetry(async()=>{calls++;throw Object.assign(new Error("unavailable"),{code:"P1017"});}),/unavailable/);assert.equal(calls,2);
});
