import { TOKEN_KIND, KEYWORD } from "./tokenizer.js";

export const STATEMENT = /**@type { const } */ ({
    ANY_LITERAL: "any literal",
    VAR_DECLORATION: "var decloaration",

    E_PRIMARY: "primary",
    E: "expression",
    E_paren: "expression with parentheses",
    E_unari_minus: "expression with unari minus",
    E_additive_expression_unari: "additive expression unari",
    E_additive_expression_binary: "additive expression binary",
    E_additive_expression: "additive expression",
});

/**
 * @param { any } target 
 * @param { statement } source 
 */
function assign(target, source) {
    Object.assign(target, source);
}

/**@type { Record<valueOf<STATEMENT>, statement> } */
export const statements = /**@type {any} */ (Object.values(STATEMENT).reduce((accum, key) => { accum[key] = {}; return accum }, {}));


assign(statements[STATEMENT.E_paren], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.PUNCTUATOR,
                        text: "("
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E]
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.PUNCTUATOR,
                        text: ")"
                    }
                }
            ]
        }
    ]
});

assign(statements[STATEMENT.E_unari_minus], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.PUNCTUATOR,
                        text: "-"
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_PRIMARY]
                }
            ]
        }
    ]
});

assign(statements[STATEMENT.E_PRIMARY], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_paren]
                },
                {
                    type: "plain",
                    value: {
                        match: "any",
                        type: TOKEN_KIND.NUMERIC_LITERAL
                    }
                },
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_unari_minus]
                },
            ]
        }
    ]
});

assign(statements[STATEMENT.E_additive_expression_unari], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_PRIMARY]
                }
            ]
        }
    ]
});

assign(statements[STATEMENT.E_additive_expression_binary], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_PRIMARY]
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.PUNCTUATOR,
                        text: "+"
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_PRIMARY]
                }
            ]
        }
    ]
});

assign(statements[STATEMENT.E_additive_expression], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_additive_expression_binary]
                },
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_additive_expression_unari]
                }
            ]
        }
    ]
});



assign(statements[STATEMENT.E], {
    primary: true,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.E_additive_expression]
                }
            ]
        }
    ]
});







assign(statements[STATEMENT.ANY_LITERAL], {
    primary: false,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "any",
                        type: TOKEN_KIND.STRING_LITERAL
                    }
                },
                {
                    type: "plain",
                    value: {
                        match: "any",
                        type: TOKEN_KIND.NUMERIC_LITERAL
                    }
                }
            ]
        }
    ]
});





assign(statements[STATEMENT.VAR_DECLORATION], {
    primary: true,
    chain: [
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.KEYWORD,
                        text: KEYWORD.VAR
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "any",
                        type: TOKEN_KIND.IDENTIFIER_NAME
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "plain",
                    value: {
                        match: "exact",
                        type: TOKEN_KIND.PUNCTUATOR,
                        text: "="
                    }
                }
            ]
        },
        {
            optional: false,
            elements: [
                {
                    type: "recursive",
                    value: statements[STATEMENT.ANY_LITERAL]
                }
            ]
        }
    ]
});