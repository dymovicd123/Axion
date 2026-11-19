(function (root, factory) {
    const engine = factory();
    if (typeof module === 'object' && module.exports) module.exports = engine;
    else root.AxionExpression = engine;
})(typeof globalThis === 'object' ? globalThis : this, function () {
    const functions = {
        sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos,
        atan: Math.atan, sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp,
        ln: Math.log, log: Math.log10, floor: Math.floor, ceil: Math.ceil
    };
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
    const MAX_LENGTH = 140;

    function tokenize(source) {
        if (typeof source !== 'string' || source.length > MAX_LENGTH || !source.trim()) {
            throw Error('Enter a formula shorter than 140 characters.');
        }
        const text = source.replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const raw = [];
        let i = 0;
        while (i < text.length) {
            if (/\s/.test(text[i])) { i++; continue; }
            const number = text.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
            if (number) {
                raw.push({ type: 'number', value: Number(number[0]) });
                i += number[0].length;
                continue;
            }
            const name = text.slice(i).match(/^[a-zA-Z]+/);
            if (name) {
                const value = name[0].toLowerCase();
                if (!['x','pi','e'].includes(value) && !Object.hasOwn(functions, value)) {
                    throw Error('Unknown symbol: ' + name[0]);
                }
                raw.push({ type: Object.hasOwn(functions, value) ? 'function' : 'name', value });
                i += name[0].length;
                continue;
            }
            if ('+-*/^()'.includes(text[i])) {
                raw.push({ type: text[i], value: text[i] });
                i++;
                continue;
            }
            throw Error('Unsupported character: ' + text[i]);
        }
        if (raw.length > 100) throw Error('The formula is too long.');
        const tokens = [];
        for (let j = 0; j < raw.length; j++) {
            const item = raw[j], previous = tokens[tokens.length - 1];
            const end = previous && ['number','name',')'].includes(previous.type);
            const beginning = ['number','name','function','('].includes(item.type);
            if (end && beginning) tokens.push({ type: '*', value: '*' });
            tokens.push(item);
        }
        return tokens;
    }

    function parse(source) {
        const tokens = tokenize(source);
        let position = 0, nodes = 0;
        function parseExpression(minimum = 0, depth = 0) {
            if (depth > 40 || ++nodes > 180) throw Error('Formula is too complicated.');
            const token = tokens[position++];
            if (!token) throw Error('The formula is incomplete.');
            let left;
            if (token.type === 'number' || token.type === 'name') {
                left = token;
            } else if (token.type === '+' || token.type === '-') {
                left = { type: 'unary', op: token.type, child: parseExpression(4, depth + 1) };
            } else if (token.type === '(') {
                left = parseExpression(0, depth + 1);
                if (tokens[position++]?.type !== ')') throw Error('Missing closing parenthesis.');
            } else if (token.type === 'function') {
                if (tokens[position++]?.type !== '(') throw Error(token.value + ' needs parentheses, like sin(x).');
                const argument = parseExpression(0, depth + 1);
                if (tokens[position++]?.type !== ')') throw Error('Missing closing parenthesis.');
                left = { type: 'call', name: token.value, argument };
            } else {
                throw Error('Unexpected symbol: ' + token.value);
            }
            while (position < tokens.length) {
                const operator = tokens[position].type;
                const level = precedence[operator];
                if (!level || level < minimum) break;
                position++;
                const right = parseExpression(level + (operator === '^' ? 0 : 1), depth + 1);
                left = { type: 'binary', op: operator, left, right };
            }
            return left;
        }
        const ast = parseExpression();
        if (position !== tokens.length) throw Error('Check the formula near ' + tokens[position].value);
        return ast;
    }

    function evaluate(node, x) {
        if (node.type === 'number') return node.value;
        if (node.type === 'name') return node.value === 'x' ? x : node.value === 'pi' ? Math.PI : Math.E;
        if (node.type === 'unary') {
            const value = evaluate(node.child, x);
            return node.op === '-' ? -value : value;
        }
        if (node.type === 'call') return functions[node.name](evaluate(node.argument, x));
        const a = evaluate(node.left, x), b = evaluate(node.right, x);
        switch (node.op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            case '^': return Math.pow(a, b);
        }
        return NaN;
    }

    function compile(source) {
        const ast = parse(source);
        return function (x) {
            if (!Number.isFinite(x)) return NaN;
            const result = evaluate(ast, x);
            return typeof result === 'number' ? result : NaN;
        };
    }

    function build(config) {
        if (!config || typeof config !== 'object') throw Error('Missing function settings.');
        const a = Number(config.a);
        if (!Number.isFinite(a) || a < -20 || a > 20) throw Error('The target x must be between -20 and 20.');
        const piecewise = config.mode === 'piecewise';
        if (!piecewise && config.mode !== 'single') throw Error('Choose single or piecewise mode.');
        const left = compile(config.left);
        const right = piecewise ? compile(config.right) : left;
        const pointMode = config.pointMode;
        if (!['auto','undefined','custom'].includes(pointMode)) throw Error('Invalid point setting.');
        let custom = null;
        if (pointMode === 'custom') {
            if (config.pointValue === '' || config.pointValue === null || config.pointValue === undefined) throw Error('Enter a value for f(a).');
            custom = Number(config.pointValue);
            if (!Number.isFinite(custom) || Math.abs(custom) > 1e6) throw Error('The point value must be a finite number.');
        }
        function at(x) {
            if (Math.abs(x - a) <= 1e-12) {
                if (pointMode === 'undefined') return NaN;
                if (pointMode === 'custom') return custom;
                const exact = piecewise ? right(a) : left(a);
                return Number.isFinite(exact) ? exact : NaN;
            }
            return x < a ? left(x) : right(x);
        }
        return { a, left, right, at, piecewise };
    }

    function sample(model, distance) {
        const d = Number(distance);
        if (!Number.isFinite(d) || d <= 0 || d > 10) throw Error('Invalid distance.');
        return { left: model.left(model.a - d), right: model.right(model.a + d), distance: d };
    }
    function format(value) {
        if (Number.isNaN(value)) return 'undefined';
        if (value === Infinity) return '+∞';
        if (value === -Infinity) return '−∞';
        if (!Number.isFinite(value)) return 'undefined';
        if (value !== 0 && (Math.abs(value) >= 100000 || Math.abs(value) < .00001)) return value.toExponential(3);
        return String(Number(value.toPrecision(7)));
    }
    return { tokenize, parse, compile, build, sample, format };
});
