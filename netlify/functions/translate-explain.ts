import { translateExplainVerse } from "../../lib/geminiService";
import { createNetlifyPostHandler } from "../../lib/netlifyHandler";

export default createNetlifyPostHandler<{
  verseText?: string;
  translation?: string;
  source?: string;
  origin?: string;
  targetLanguage?: string;
}>((body) => translateExplainVerse(body));
