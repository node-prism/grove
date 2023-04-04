import chalk, { ChalkInstance } from "chalk";

function getKeyByValue(object: object, value: any) {
  return Object.keys(object).find(key => object[key] === value);
}

export enum LogLevel {
  SILENT,
  INFO,
  WARN,
  ERROR,
  DEBUG
}

const levels = {
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  debug: LogLevel.DEBUG
};

const colors = {
  [LogLevel.INFO]: chalk.green,
  [LogLevel.WARN]: chalk.yellow,
  [LogLevel.ERROR]: chalk.red,
  [LogLevel.DEBUG]: chalk.blue
};

export default function log({ level, scope }: { level: LogLevel, scope?: string }, ...parts: any[]) {
  const loglevel = Number(process.env.LOGLEVEL ?? LogLevel.ERROR);

  if (level > loglevel || loglevel === LogLevel.SILENT) return;

  const levelName = colors[level](getKeyByValue(levels, level));
  const date = new Date();
  const formattedDate = chalk.cyan(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  const message = parts.join(' ');

  let output = `[${formattedDate}][${levelName}]${scope ? `[${chalk.yellow(scope)}]` : ''} ${message}`;
  console.log(output);
}
