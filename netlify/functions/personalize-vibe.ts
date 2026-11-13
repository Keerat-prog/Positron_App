import { personalizeDailyVibe } from "../../lib/geminiService";
import { createNetlifyPostHandler } from "../../lib/netlifyHandler";

export default createNetlifyPostHandler<{ problem?: string; mood?: string; situation?: string }>((body) =>
  personalizeDailyVibe(body)
);
