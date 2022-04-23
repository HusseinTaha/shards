import util from 'util';
import { ShardsRule, WhitelistingMatching } from './src/common/shards-rule.type';
const bunyan = require('bunyan'); 
const pkg = require('./package.json');

const parseLogLevel = (envValue?: string) => {
  const defaultLevel = 'INFO';
  const desiredLevel = envValue ? String(envValue).toUpperCase() : defaultLevel;
  const levels = [
    'FATAL',
    'ERROR',
    'WARN',
    'INFO',
    'DEBUG',
    'TRACE'
  ];

  const hasMatch = levels.includes(desiredLevel);
  const level = hasMatch ? desiredLevel : defaultLevel;

  if (!hasMatch) {
    const available = `Please specify one of ${util.inspect(levels)}.`;
    const message = `Uknown log level "${desiredLevel}". ${available}`;
    throw new Error(message);
  }

  return bunyan[level];
};


const shardRules: Record<string, ShardsRule> = {
  '/proxy': {
    target: 'http://www.proxiedService.com',
    whitelist: {
      GET: {
        method: WhitelistingMatching.URL_REGEX,
        matchSettings: [{'/api/v1/users/': 'jeko'}]
      }
    }
  }
};

export const config = {
  name: 'routing-worker',
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
  http: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.hasOwnProperty('PORT')
      ? parseInt(process.env.PORT!, 10)
      : 8000,
    prefix: `/${pkg.api}`
  },
  shardRules
}
