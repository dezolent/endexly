/**
 * /api/disable-draft — Exit Next.js Draft Mode.
 * Linked from the yellow preview banner shown on every draft-mode page.
 */

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  // Redirect back to the page the user was on (or home)
  const referer = req.headers.get("referer");
  const returnTo =
    referer && new URL(referer).pathname !== "/api/disable-draft"
      ? new URL(referer).pathname
      : "/";

  redirect(returnTo);
}
