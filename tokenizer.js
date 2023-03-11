const PUNCTUATOR = /**@type {const} */ ([
    "--", "++",
    ".",
    "<", ">", "<=", ">=",
    "!=", "==",
    "+", "-",
    "=", "+=", "-=",
    "(", ")", "[", "]", "{", "}",
    "!", ":", ";", ","
]);

const WHITESPACE = /**@type {const} */ ([
    " ", "\n"
]);

export const KEYWORD = /**@type {const} */ ({
    IF: "if",
    FOR: "for",
    OF: "of",
    LET: "let",
    VAR: "var",
    THIS: "this"
});

const BOOLEAN_LITERAL = /**@type {const} */ ({
    TRUE: "true",
    FALSE: "false"
});

const NULL_LITERAL = /**@type {const} */ ({
    NULL: "null"
});

export const TOKEN_KIND = /**@type {const} */ ({
    KEYWORD: "keyword",
    PUNCTUATOR: "punctuator",

    IDENTIFIER_NAME: "identifier name",

    NULL_LITERAL: "null literal",
    BOOLEAN_LITERAL: "boolean literal",
    STRING_LITERAL: "string literal",
    NUMERIC_LITERAL: "numeric literal"
});

const KNOWN_TOKENS = /**@type {const} */ ({
    ...Object.fromEntries(Object.values(NULL_LITERAL).map((w) => [w, TOKEN_KIND.NULL_LITERAL])),

    ...Object.fromEntries(Object.values(BOOLEAN_LITERAL).map((w) => [w, TOKEN_KIND.BOOLEAN_LITERAL])),

    ...Object.fromEntries(Object.values(KEYWORD).map((w) => [w, TOKEN_KIND.KEYWORD])),
});

const isStartOfIdentifierName = (function(){
    const exp = new RegExp(/^[a-zA-Z]$/);
    return function(char) {
        return exp.test(char);
    }
})();

const isPartOfIdentifierName = (function(){
    const exp = new RegExp(/^[a-zA-Z0-9]$/);
    return function(char) {
        return exp.test(char);
    }
})();

const isPartOfNumericLiteral = (function(){
    const exp = new RegExp(/^[0-9]$/);
    return function(char) {
        return exp.test(char);
    }
})();


/**
 * 
 * @param { string } str
 * @yields { token }
 */
export function* tokenizer(str) {
    //let index = 0;

    const tokens = [];

    token_loop:
    for (let index = 0; index < str.length;) {
        const char = str[index];
        
        //@ts-ignore
        if (WHITESPACE.includes(char)) {
            index++;
            continue token_loop;
        }

        //punctuator
        for (const symbol of PUNCTUATOR) if (str.startsWith(symbol, index)) {
            /**@type {token} */
            const token = {
                text: symbol,
                kind: TOKEN_KIND.PUNCTUATOR
            };
            index+= symbol.length;
            yield token;
            continue token_loop;
        }

        //IdentifierName
        if (isStartOfIdentifierName(char)) {
            let n = 1;
            while (isPartOfIdentifierName(str[index + n])) n++;
            const text = str.substring(index, index + n);
            const token = {
                text,
                kind: KNOWN_TOKENS[text] ?? TOKEN_KIND.IDENTIFIER_NAME
            };
            index+= n;
            yield token;
            continue token_loop;
        }

        //String Literals
        if (char == '"') {
            let n = 1;
            while (str[index + n] != '"') n++;
            /**@type {token} */
            const token = {
                text: str.substring(index, index + ++n),
                kind: TOKEN_KIND.STRING_LITERAL
            };
            index+= n;
            yield token;
            continue token_loop;
        }

        //Numeric Literals
        if (isPartOfNumericLiteral(char)) {
            let n = 1;
            while (isPartOfIdentifierName(str[index + n])) n++;
            if (str[index + n] == ".") {
                n++;
                const c = str[index + n];
                while (isPartOfIdentifierName(str[index + n])) n++;
            }
            const token = {
                text: str.substring(index, index + n),
                kind: TOKEN_KIND.NUMERIC_LITERAL
            };
            index+= n;
            yield token;
            continue token_loop;
        }

        throw new Error(`unexpected token starts with: ${char}`);
        
    }
}
