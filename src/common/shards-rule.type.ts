export enum WhitelistingMatching {
    URL_REGEX,
    REQUEST_BODY_PARAM,
    QUERY_STRING
}

export type ParamMatch = Record<string, string>;

export type WhiteListRule = {
    method: WhitelistingMatching;
    matchSettings?: ParamMatch[];
};

export type ShardsRule = {
    target: string;
    whitelist: Record<string, WhiteListRule>;
};