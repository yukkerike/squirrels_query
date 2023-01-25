//  Module:     Logger
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const fs = require('fs')
const util = require('util')

const LoggerDefaults = {
    options: {
        logFile: 1,
        debug: 0,
        info: 1,
        warn: 1,
        error: 1,
        fatal: 1
    },
    levels: {
        unk: '\x1b[1m',
        debug: '\x1b[30m\x1b[47mDEBUG\x1b[0m \x1b[1m',
        info: '\x1b[1m',
        warn: '\x1b[30m\x1b[43mWARN\x1b[0m \x1b[1m\x1b[33m',
        error: '\x1b[1m\x1b[41mERROR\x1b[0m \x1b[1m\x1b[31m',
        fatal: '\x1b[1m\x1b[41mFATAL\x1b[0m \x1b[1m\x1b[31m'
    },
    func: console.log,
    writers: new Object(null)
}

class Logger {
    static setOptions(options) {
        this.options = options
    }
    static setLevels(levels) {
        this.levels = levels;
        for(let level of Object.keys(levels))
            this[level] = this[level] || ((type, ...parts) => {
                return this.addLine(level, type, ...parts)
            })
    }
    static setFunc(func) {
        this.func = func
    }
    static setWriters(writers) {
        this.writers = writers
    }
    static createWriter(type) {
        return fs.createWriteStream(
            type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + '.log', {
                flags: 'w+',
                encoding: 'utf8',
                autoClose: true
            }
        )
    }
    static formatLine(...parts) {
        let line = '';
        for(let part of parts) {
            line += line !== '' ? '\t' : '';
            line += typeof part === 'string' ? part : util.inspect(
                part, {
                    depth: 4,
                    colors: false
                }
            )
        };
        return line
    }
    static addLineToFile(type, line) {
        if(!this.writers[type] || !this.writers[type].writable)
            this.writers[type] = this.createWriter(type)
        else
            line += '\r\n'
        this.writers[type].write(line)
    }
    static addLineToConsole(level, line) {
        line = this.levels[level] + line + '\x1b[0m';
        return this.func(line)
    }
    static addLine(level, type, ...parts) {
        if(level !== 'unk' && !this.options[level])
            return
        let line = this.formatLine(...parts)
        this.addLineToConsole(level, line);
        if(!this.options.logFile)
            return
        this.addLineToFile(type, line)
    }
}

Logger.setOptions(LoggerDefaults.options)
Logger.setLevels(LoggerDefaults.levels)
Logger.setFunc(LoggerDefaults.func)
Logger.setWriters(LoggerDefaults.writers)

module.exports = {
    Logger: Logger
}