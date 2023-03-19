import chalk, { ChalkInstance } from "chalk";

function getKeyByValue(object: object, value: any) {
  return Object.keys(object).find((key) => object[key] === value);
}

export enum LogLevel {
  SILENT = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  DEBUG = 4,
}

export const levels: { [key: string]: number } = {
  info: 1,
  warn: 2,
  error: 3,
  debug: 4,
};

const colors: { [level: number]: ChalkInstance } = {
  1: chalk.green,
  2: chalk.yellow,
  3: chalk.red,
  4: chalk.blue,
};

export default function ({ level, scope = undefined }: { level: LogLevel, scope?: string }, ...parts: any[]) {
  const loglevel = Number(process.env.LOGLEVEL ?? LogLevel.ERROR);
  
  if (level > loglevel || loglevel === LogLevel.SILENT) {
    return;
  }

  const levelName = colors[level](getKeyByValue(levels, level));
  const date = new Date();
  const formattedDate = chalk.cyan(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  const message = parts.join(" ");
  
  let output = `[${formattedDate}][${levelName}]`;
  if (scope) {
    output += `[${chalk.yellow(scope)}]`;
  }
  
  output += ` ${message}`;
  console.log(output);
}
