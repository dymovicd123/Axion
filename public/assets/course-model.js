(function (root) {
    function number(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
        if (typeof value !== 'string' || value.length > 60) return NaN;
        const text = value.trim().replace(/−/g, '-').replace(/,/g, '.');
        if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return Number(text);
        const fraction = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
        return fraction && Number(fraction[2]) !== 0 ? Number(fraction[1]) / Number(fraction[2]) : NaN;
    }
    function analyse(a, b, c) {
        if (![a, b, c].every(Number.isFinite) || a >= 0 || Math.max(Math.abs(a), Math.abs(b), Math.abs(c)) > 100) return null;
        const at = x => a * x * x + b * x + c;
        const h = -b / (2 * a);
        const k = at(h);
        const highest = at(Math.max(0, Math.min(8, h)));
        const near = (x, y) => Math.abs(x - y) < 1e-6;
        const checks = {
            launch: near(c, 2), hoop: near(at(8), 3), clearance: at(4) >= 4.5 - 1e-8,
            ceiling: highest <= 6 + 1e-8, descending: 16 * a + b < -1e-8
        };
        return { h, k, highest, middle: at(4), end: at(8), checks, correct: Object.values(checks).every(Boolean) };
    }
    if (typeof module === 'object' && module.exports) module.exports = { analyse, number };
    else root.CourseModel = { analyse, number };
})(typeof window === 'undefined' ? globalThis : window);
