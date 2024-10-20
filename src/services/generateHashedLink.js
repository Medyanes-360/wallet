import { createHash } from "crypto";

export default function generateHashedLink(link) {
  const hash = createHash("sha256").update(link).digest("hex");

  return hash;
}
