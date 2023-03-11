import { tokenizer, TOKEN_KIND, KEYWORD } from "./tokenizer.js";

const data =
`<div>
    <h1>{push(this.data)}</h1>
    <h1>{push(data)}</h1>
    {
        var data = 42.84
        var str = "asd";
    }
    <table>
        {push(data)}
        <tbody>
            {
                for (let data of smth) {
                    shift("<tr>{data.title}</tr>");
                    push("<tr>{data.title}</tr>");
                }
            }
        </tbody>
    </table>
</div>`;

const block1 = `
var data = 42.8;
var str = "asd";`;
const block2 = `
for (let data of smth) {
    shift("<tr>{data.title}</tr>");
    push("<tr>{data.title}</tr>");
}
push(this.data[4])
var data = - 48.4
var b = (data == 48.4)
let json = {
    key1: 42.7,
    key2: null,
    key3: false
}`;


/**@type  { Record<string, statement> } */
const statements = {};

statements.anyLiteral = {
    primary: false,
    chain: [
        {
            type: "plain",
            value: [
                {
                    match: "any",
                    type: TOKEN_KIND.NUMERIC_LITERAL
                },
                {
                    match: "any",
                    type: TOKEN_KIND.STRING_LITERAL
                }
            ]
        }
    ]
};

statements.vardec = {
    primary: true,
    chain: [
        {
            type: "plain",
            value: [
                {
                    match: "exact",
                    type: TOKEN_KIND.KEYWORD,
                    text: KEYWORD.VAR
                }
            ]
        },
        {
            type: "plain",
            value: [
                {
                    match: "any",
                    type: TOKEN_KIND.IDENTIFIER_NAME
                }
            ]
        },
        {
            type: "plain",
            value: [
                {
                    match: "exact",
                    type: TOKEN_KIND.PUNCTUATOR,
                    text: "="
                }
            ]
        },
        {
            type: "recursive",
            value: [statements.anyLiteral]
        }
    ]
}

/**
 * @param { statementMatch[] } chain 
 * @param { token[] } buffer 
 * @param { Generator<token, void, unknown> } lexer 
 * @returns { [boolean, null | number] }
 */
function chechChain(chain, buffer, lexer, index = 0) {

    const initialIndex = index;
    let lexer_done = false;

    next_token:
    for (const matchs of chain) {
        while (buffer.length <= index) {
            const { value, done } = lexer.next();
            lexer_done = done;
            if (lexer_done) return [lexer_done, null];
            if (index == 0 && value && value.text == ";") continue;
            buffer.push(/**@type {token}*/(value));
        }

        const token = buffer[index++];

        if (matchs.type == "plain") {
            for (const match of matchs.value) {
                if (token == undefined) return [lexer_done, null];

                if (match.match == "any") {
                    if (token.kind == match.type) {
                        continue next_token;
                    }
                }
                if (match.match == "exact") {
                    if (token.kind == match.type && token.text == match.text) {
                        continue next_token;
                    }
                }

            }
            return [lexer_done, null];
        }

        if (matchs.type == "recursive") {
            index--;
            for (const match of matchs.value) {
                const [done, len] = chechChain(match.chain, buffer, lexer, index);
                lexer_done = done;
                if (len !== null) {
                    index += len
                    continue next_token;
                };
            }
            return [lexer_done, null];
        }

        throw new Error("unreachable");
    }

    return [lexer_done, index - initialIndex];

}

const lexer = tokenizer(block1);

let chainName;
const buffer = [];
while ((chainName = getNextChain(lexer, buffer)) !== null) {
    console.log(chainName);
}

/**
 * @param { Generator<token> } lexer 
 * @param { token[] } buffer
 */
function getNextChain(lexer, buffer = []) {

    for (const [name, statement] of Object.entries(statements)) {
        if (statement.primary) {
            let [done, n] = chechChain(statement.chain, buffer, lexer);
            if (done) return null;
            if (n == null) continue;
            while ((n--) > 0) {
                buffer.shift();
            }
            return name;
        }
    }

    throw new Error(`no such token chain: "${buffer.map(({ text }) => text).toString()}"`);

}
