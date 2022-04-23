import { Next, Request, Response } from 'restify';
import httpProxy from 'http-proxy';
import { ShardsRule } from './common/shards-rule.type';

const matchShardRule = (shardingRules: Record<string, ShardsRule> ,
    method: string, url:string, body: any, query: any ): boolean=>{

    // (proxy in shardingRules) &&
    //     shardingRules[proxy].whitelist &&
    //     shardingRules[proxy].whitelist[method] &&
    //     Array.isArray(shardingRules[proxy].whitelist[method]) &&
    //     shardingRules[proxy].whitelist[method]
    //         .some(path => req.url?.startsWith(`${proxy}${path}`)


    return false;
};

export const setupShards = (shardingRules: Record<string, ShardsRule> = {}) => {
    // Setup proxy server if we have proxies
    const httpProxyServer = Object.keys(shardingRules).length > 0
        ? httpProxy.createProxyServer({})
        : undefined;

    return  (req: Request, res: Response, next: Next) => {
        if (httpProxyServer === undefined) {
            return next();
        }

        const method = req.method as string;

        const proxy = `/${req?.url?.split('/')[1]}`;

        if (matchShardRule(shardingRules, method, req.url as string, req.body, req.query)){
            req.url = req.url?.substring(proxy.length);

            // complete the actual proxy'ing of the request
            httpProxyServer.web(req, res, {
                target: shardingRules[proxy].target,
            });
        } else {
            next();
        }
    };
};