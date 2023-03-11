type valueOf<T> = T[ keyof T ];

type tokenKind = valueOf< typeof import("./tokenizer.js").TOKEN_KIND >;

type statement = {
    primary: boolean;
    chain: statementMatch[];
};

type statementMatch = {
    type: "recursive";
    value: statement[];
} | {
    type: "plain";
    value: tokenMatch[];
};

type tokenMatch = {
    match: "exact";
    type: tokenKind;
    text: string;
} | {
    match: "any";
    type: tokenKind;
};

type token = {
    text: string,
    kind: tokenKind
};