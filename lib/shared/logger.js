import chalk from "chalk";
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["SILENT"] = 0] = "SILENT";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})(LogLevel || (LogLevel = {}));
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
export default function log({ level, scope }, ...parts) {
    const loglevel = Number(process.env.LOGLEVEL ?? LogLevel.ERROR);
    if (level > loglevel || loglevel === LogLevel.SILENT)
        return;
    const levelName = colors[level](getKeyByValue(levels, level));
    const date = new Date();
    const formattedDate = chalk.cyan(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
    const message = parts.join(' ');
    let output = `[${formattedDate}][${levelName}]${scope ? `[${chalk.yellow(scope)}]` : ''} ${message}`;
    console.log(output);
}
//# sourceMappingURL=logger.js.map