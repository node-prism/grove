import { describe } from "manten";

await describe("jwt", async ({ runTestSuite }) => {
  runTestSuite(import("./jwt.test.js"));
});

await describe("hasher", async ({ runTestSuite }) => {
  runTestSuite(import("./hash.test.js"));
});
