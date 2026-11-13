import { generateSacredMusic } from "../../lib/geminiService";
import { createNetlifyPostHandler } from "../../lib/netlifyHandler";

export default createNetlifyPostHandler<{ prompt?: string; model?: string; style?: string }>((body) =>
  generateSacredMusic(body)
);
