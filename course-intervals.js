const Algebra = require('./course-algebra');

function equal(a, b) {
    return a === b || Algebra.close(a, b);
}

function endpoint(text) {
    const value = text.trim().replace(/−/g, '-').toLowerCase();
    if (/^\+?(inf(?:inity)?|∞)$/.test(value)) return Infinity;
    if (/^-(inf(?:inity)?|∞)$/.test(value)) return -Infinity;
    const n = Algebra.constant(value);
    if (!Number.isFinite(n)) throw Error('Invalid interval endpoint.');
    return n;
}

function normalize(parts) {
    parts.sort((a, b) => a.lo - b.lo || Number(b.left) - Number(a.left));
    const result = [];
    for (const part of parts) {
        const last = result.at(-1);
        if (!last || (!equal(part.lo, last.hi) && part.lo > last.hi) ||
            (equal(part.lo, last.hi) && !part.left && !last.right)) {
            result.push({ ...part });
        } else if (equal(last.hi, part.hi)) {
            last.right ||= part.right;
        } else if (part.hi > last.hi) {
            last.hi = part.hi;
            last.right = part.right;
        }
    }
    return result;
}

function parse(value) {
    const text = String(value).trim().replace(/−/g, '-');
    if (/^(empty|none|∅|\{\})$/i.test(text)) return [];
    if (/^(all|all real numbers|R|ℝ)$/i.test(text)) return [{ lo: -Infinity, hi: Infinity, left: false, right: false }];
    return normalize(text.split(/\s*(?:∪|\bunion\b|U)\s*/i).map(piece => {
        const single = piece.match(/^\{([^{}]+)\}$/);
        if (single) {
            const n = endpoint(single[1]);
            if (!Number.isFinite(n)) throw Error('Infinity is not a point.');
            return { lo: n, hi: n, left: true, right: true };
        }
        const interval = piece.match(/^([\[(])([^,]+),([^,]+)([\])])$/);
        if (!interval) throw Error('Use interval notation.');
        const lo = endpoint(interval[2]), hi = endpoint(interval[3]);
        const left = interval[1] === '[', right = interval[4] === ']';
        if (lo > hi || (lo === hi && (!left || !right)) || lo === Infinity || hi === -Infinity ||
            (lo === -Infinity && left) || (hi === Infinity && right)) throw Error('Invalid interval.');
        return { lo, hi, left, right };
    }));
}

function equivalent(value, expected) {
    try {
        const a = parse(value), b = parse(expected);
        return a.length === b.length && a.every((part, i) => equal(part.lo, b[i].lo) &&
            equal(part.hi, b[i].hi) && part.left === b[i].left && part.right === b[i].right);
    } catch { return false; }
}

module.exports = { parse, equivalent };
