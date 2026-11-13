import { analyzeDiaryEntry } from "../../lib/geminiService";
import { createNetlifyPostHandler } from "../../lib/netlifyHandler";

export default createNetlifyPostHandler<{ content: string }>((body) =>
  analyzeDiaryEntry(body.content)
);
