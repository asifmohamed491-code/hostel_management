import { config } from "dotenv";
config({ path: ".env.local" });

import { generateToken, AUTH_COOKIE_NAME } from "../lib/jwt";

async function main() {
  const token = generateToken({
    userId: "6aabfbe73192891bf98e71a1",
    role: "warden",
  });

  const res = await fetch("http://localhost:3000/api/attendance/stats", {
    headers: {
      Cookie: `${AUTH_COOKIE_NAME}=${token}`,
    },
  });

  console.log("Stats status:", res.status);
  const data = await res.json();
  console.log("Stats response:\n", JSON.stringify(data, null, 2));
  process.exit(0);
}

main().catch(console.error);
