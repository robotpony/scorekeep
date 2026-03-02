#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { configureColor } from './format.js';
import { list } from './commands/list.js';
import { info } from './commands/info.js';
import { validate } from './commands/validate.js';
import { scoreTable } from './commands/score-table.js';

const USAGE = `
  scorekeep — Score tracking for card and dice games.

  Usage:
    scorekeep <command> [options]

  Commands:
    list                 List all available games
    info <game-id>       Show full game reference (rules, scoring, config)
    validate [game-id]   Validate game definition TOML files
    score-table <game-id> Show scoring reference table

  Options:
    --help               Show this help message
    --no-color           Disable colour output
    --json               Output as JSON
`.trimStart();

interface CliOptions {
  help: boolean;
  noColor: boolean;
  json: boolean;
}

function parseCliArgs(argv: string[]): { command: string | undefined; args: string[]; options: CliOptions } {
  const { values, positionals } = parseArgs({
    args: argv.slice(2),
    options: {
      help: { type: 'boolean', default: false },
      'no-color': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: true,
  });

  return {
    command: positionals[0],
    args: positionals.slice(1),
    options: {
      help: values.help ?? false,
      noColor: values['no-color'] ?? false,
      json: values.json ?? false,
    },
  };
}

async function main(): Promise<void> {
  let parsed: ReturnType<typeof parseCliArgs>;
  try {
    parsed = parseCliArgs(process.argv);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}\n`);
    }
    console.log(USAGE);
    process.exit(1);
  }

  const { command, args, options } = parsed;

  configureColor(options.noColor);

  if (options.help || !command) {
    console.log(USAGE);
    process.exit(0);
  }

  switch (command) {
    case 'list':
      await list(options);
      break;
    case 'info':
      await info(args[0], options);
      break;
    case 'validate':
      await validate(args[0], options);
      break;
    case 'score-table':
      await scoreTable(args[0], options);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

export type { CliOptions };
