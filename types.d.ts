type valueOf<T> = T[ keyof T ];

type tokenKind = valueOf< typeof import("./tokenizer.js").TOKEN_KIND >;

type innerStatement = {
    chain: link[];
}

type statement = innerStatement & {
    primary: boolean;
};


type link = ({
    elements: statementMatch[];
} & ({
    optional: true;
    group: string;
} | {
    optional: false;
}))

type statementMatch = ({
    type: "recursive";
    value: innerStatement;
} | {
    type: "plain";
    value: tokenMatch;
});

type tokenMatch = ({
    type: tokenKind;
} & ({
    match: "exact";
    text: string;
} | {  
    match: "any";
}));

type token = {
    text: string,
    kind: tokenKind
};