const path = require('path');

// 日志根目录
const baseLogPath = path.resolve(__dirname, '../logs')

// 错误日志目录
const errorPath = "/error";
// 错误日志文件名
const errorFileName = "error";
// 错误日志输出完整路径
const errorLogPath = baseLogPath + errorPath + "/" + errorFileName;
// const errorLogPath = path.resolve(__dirname, "../logs/error/error");

// 响应日志目录
const responsePath = "/response";
// 响应日志文件名
const responseFileName = "response";
// 响应日志输出完整路径
const responseLogPath = baseLogPath + responsePath + "/" + responseFileName;
module.exports = {
    appenders:
    {
        "rule-console": {"type": "console"},
        "errorLogger": {
            "type": "dateFile",
            "filename": errorLogPath,
            "pattern": "-yyyy-MM-dd-hh.log",
            "alwaysIncludePattern": true,
            "encoding":"utf-8",
            "maxLogSize": 1000,
            "numBackups": 3,
            "path":errorPath
        },
        "resLogger": {
            "type": "dateFile",
            "filename": responseLogPath,
            "pattern": "-yyyy-MM-dd-hh.log",
            "alwaysIncludePattern": true,
            "encoding":"utf-8",
            "maxLogSize": 1000,
            "numBackups": 3,
            "path":responsePath
        },
    },
    categories: {
        "default": {"appenders": ["rule-console"], "level": "all"},
        "resLogger": {"appenders": ["resLogger"], "level": "info"},
        "errorLogger": {"appenders": ["errorLogger"], "level": "error"},
        "http": {"appenders": ["resLogger"],"level": "info"}
    },
    "baseLogPath": baseLogPath 
}