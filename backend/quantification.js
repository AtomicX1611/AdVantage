import { performance } from "perf_hooks";

const URL = "http://localhost:3000/user/addProduct";

const COOKIE = "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTY0OTI4YjI2NzFkNWI3MDA3OWU0ZWEiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2ODE5ODc5NSwiZXhwIjoxNzY4ODAzNTk1fQ.PoziObtBfDTDxD89pcLxmIGmz3qioF7HD6kLx1Bof2U";

const BODY = {
  name: "testtt",
  price: 56,
  description: "thisfbklsjdfhsdakfhdsbvsdhfglsiadkfuhdusfkbbdsukfhbsdjkbfsgdkfhkjdfhdl",
  zipCode: "522003",
  category: "Mobiles",
  district: "sdfasgs",
  city: "dsfdsfdsf",
  state: "Goa",
  isRental: false
};

const TOTAL_REQUESTS = 10_000;
const CONCURRENCY = 50;

let sent = 0;
let completed = 0;
let failed = 0;

const start = performance.now();

async function worker() {
  while (true) {
    const id = sent++;
    if (id >= TOTAL_REQUESTS) return;

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": COOKIE
        },
        body: JSON.stringify(BODY)
      });

      if (!res.ok) failed++;
    } catch (err) {
      failed++;
    } finally {
      completed++;
    }
  }
}

async function run() {
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const end = performance.now();

  console.log("\n===== Load Test Results =====");
  console.log("Requests:", TOTAL_REQUESTS);
  console.log("Completed:", completed);
  console.log("Failed:", failed);
  console.log("Total Time:", ((end - start) / 1000).toFixed(2), "sec");
  console.log("Throughput:", (TOTAL_REQUESTS / ((end - start) / 1000)).toFixed(2), "req/sec");
}

run();
