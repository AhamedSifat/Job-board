import arcjet, {
  detectBot,
  fixedWindow,
  shield,
  tokenBucket,
} from '@arcjet/next';

// Re-export the rules to simplify imports inside handlers
export { detectBot, fixedWindow, shield, tokenBucket };

// Create a base Arcjet instance for use by each handler
export default arcjet({
  key: process.env.ARCJET_KEY!,

  rules: [],
});
