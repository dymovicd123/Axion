const { parse } = require('./expression');

function close(a, b) {
    return Number.isFinite(a) && Math.abs(a - b) < 1e-8;
}

function add(a, b, sign = 1) {
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] || 0) + sign * (b[i] || 0));
}

function multiply(a, b) {
    const result = Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) result[i + j] += a[i] * b[j];
    }
    return result;
}

function normalize(p) {
    if (p.some(n => !Number.isFinite(n) || Math.abs(n) > 1e10)) throw Error('Coefficient out of range.');
    while (p.length > 1 && p.at(-1) === 0) p.pop();
    return p;
}

function polynomial(node) {
    if (node.type === 'number') return normalize([node.value]);
    if (node.type === 'name' && node.value === 'x') return [0, 1];
    if (node.type === 'unary') return normalize(polynomial(node.child).map(n => node.op === '-' ? -n : n));
    if (node.type === 'call' && node.name === 'sqrt') {
        const arg = polynomial(node.argument);
        if (arg.length === 1 && arg[0] >= 0) return normalize([Math.sqrt(arg[0])]);
    }
    if (node.type !== 'binary') throw Error('Use polynomial expressions and constant square roots.');
    const a = polynomial(node.left), b = polynomial(node.right);
    if (node.op === '+' || node.op === '-') return normalize(add(a, b, node.op === '-' ? -1 : 1));
    if (node.op === '*') {
        if (a.length + b.length > 8) throw Error('Polynomial degree too high.');
        return normalize(multiply(a, b));
    }
    if (node.op === '/' && b.length === 1 && b[0] !== 0) return normalize(a.map(n => n / b[0]));
    if (node.op === '^' && b.length === 1 && Number.isInteger(b[0]) && b[0] >= 0 && b[0] <= 6 && (a.length - 1) * b[0] <= 6) {
        let result = [1];
        for (let i = 0; i < b[0]; i++) result = multiply(result, a);
        return normalize(result);
    }
    throw Error('Use non-negative integer powers and divide only by non-zero constants.');
}

function ast(value) {
    return parse(String(value).replace(/²/g, '^2').replace(/³/g, '^3').replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)').replace(/,/g, '.'));
}

function constant(value) {
    try {
        const result = polynomial(ast(value));
        return result.length === 1 ? result[0] : NaN;
    } catch { return NaN; }
}

function isFactored(node) {
    const factors = [];
    function collect(n) {
        if (n.type === 'unary') return collect(n.child);
        if (n.type === 'binary' && n.op === '*') { collect(n.left); collect(n.right); return; }
        if (n.type === 'binary' && n.op === '/' && polynomial(n.right).length === 1) return collect(n.left);
        if (n.type === 'binary' && n.op === '^' && close(constantNode(n.right), 2) && polynomial(n.left).length === 2) {
            factors.push(1, 1);
            return;
        }
        factors.push(polynomial(n).length - 1);
    }
    collect(node);
    return factors.every(n => n <= 1) && factors.filter(n => n === 1).length === 2;
}

function constantNode(node) {
    const p = polynomial(node);
    return p.length === 1 ? p[0] : NaN;
}

function isExpanded(node) {
    if (node.type === 'unary') return isExpanded(node.child);
    if (node.type === 'binary' && ['+', '-'].includes(node.op)) return isExpanded(node.left) && isExpanded(node.right);
    if (node.type === 'binary' && node.op === '*') {
        return isExpandedMonomial(node.left) && isExpandedMonomial(node.right);
    }
    return isExpandedMonomial(node);
}

function isExpandedMonomial(node) {
    if (node.type === 'unary') return isExpandedMonomial(node.child);
    if (node.type === 'binary') {
        if (['+', '-'].includes(node.op)) return polynomial(node).length === 1;
        if (node.op === '*') return isExpandedMonomial(node.left) && isExpandedMonomial(node.right);
        if (node.op === '/') return isExpandedMonomial(node.left) && polynomial(node.right).length === 1;
        if (node.op === '^') return isExpandedMonomial(node.left) && polynomial(node.right).length === 1;
    }
    return polynomial(node).filter(n => n !== 0).length <= 1;
}

function equivalent(value, coefficients, factored = false, expanded = false) {
    try {
        const node = ast(value);
        const p = polynomial(node);
        return p.length === coefficients.length && p.every((n, i) => close(n, coefficients[i])) && (!factored || isFactored(node)) && (!expanded || isExpanded(node));
    } catch { return false; }
}

module.exports = { equivalent, constant, close, polynomial };
