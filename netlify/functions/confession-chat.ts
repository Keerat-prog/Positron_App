import { runConfessionChat } from "../../lib/geminiService";
import { createNetlifyPostHandler } from "../../lib/netlifyHandler";

export default createNetlifyPostHandler<{ message: string; history?: unknown[] }>((body) =>
  runConfessionChat(body)
);
