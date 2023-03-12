import { tokenizer } from "./tokenizer.js";
import { statements } from "./productions.js";


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
(48.4 + 15);
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



/**
 * @param { statement["chain"] } chain 
 * @param { token[] } buffer 
 * @param { Generator<token, void, unknown> } lexer 
 * @returns { [boolean, null | number] }
 */
function chechChain(chain, buffer, lexer, index = 0) {

    const initialIndex = index;
    let lexer_done = false;

    next_token:
    for (const matchs of chain) {

        if (index == 0 && buffer.length > 0 && buffer[0].text == ";") buffer.shift();
        while (buffer.length <= index) {
            const { value, done } = lexer.next();
            lexer_done = done;
            if (lexer_done) return [lexer_done, null];
            if (index == 0 && value && value.text == ";") continue;
            buffer.push(/**@type {token}*/(value));
        }

        const token = buffer[index++];


        for (const match of matchs.elements) {
            if (match.type == "plain") {
                if (token == undefined) return [lexer_done, null];

                if (match.value.match == "any") {
                    if (token.kind == match.value.type) {
                        continue next_token;
                    }
                }
                if (match.value.match == "exact") {
                    if (token.kind == match.value.type && token.text == match.value.text) {
                        continue next_token;
                    }
                }
            }
            if (match.type == "recursive") {
                //index--;
                const chain = match.value.chain;
                console.log("--", ">>");
                const [done, len] = chechChain(chain, buffer, lexer, index - 1);
                lexer_done = done;
                if (len !== null) {
                    index += len - 1;
                    continue next_token;
                };
            }
        }
        return [lexer_done, null];

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
            console.log("-", ">");
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
