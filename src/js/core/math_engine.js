/**
 * SAMUEL.A.I - Core Mathematical Engine (ES6 Module)
 * Rumus Perpangkatan Universal 4.0
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 */

export const GAUSS_NODES_16 = [
    -0.989400934991650, -0.944575023073233, -0.865631202387832, -0.755404408355003,
    -0.617876244402644, -0.458016777657227, -0.281603550779259, -0.095012509837637,
     0.095012509837637,  0.281603550779259,  0.458016777657227,  0.617876244402644,
     0.755404408355003,  0.865631202387832,  0.944575023073233,  0.989400934991650
];

export const GAUSS_WEIGHTS_16 = [
    0.027152459411754, 0.062253523938648, 0.095158511682493, 0.124628971255534,
    0.149595988816577, 0.169156519395003, 0.182603415044924, 0.189450610455068,
    0.189450610455068, 0.182603415044924, 0.169156519395003, 0.149595988816577,
    0.124628971255534, 0.095158511682493, 0.062253523938648, 0.027152459411754
];

export const SOPHOMORE_CONSTANT = 0.783430510712134;

export function binomial(n, k) {
    if (k < 0 || k > n) return 0n;
    if (k === 0 || k === n) return 1n;
    if (k > n / 2) k = n - k;
    let res = 1n;
    for (let i = 1n; i <= BigInt(k); i++) {
        res = (res * (BigInt(n) - BigInt(k) + i)) / i;
    }
    return res;
}

export function evaluateNewtonBinomial(x, y, n) {
    let sum = 0;
    for (let k = 0; k <= n; k++) {
        const coef = Number(binomial(n, k));
        const term = coef * Math.pow(x, n - k) * Math.pow(-1, k) * Math.pow(y, k);
        sum += term;
    }
    return sum;
}

export function computeBinomialDerivY(x, y, n, k = 1) {
    let sum = 0;
    const start = Math.max(1, k);
    for (let i = start; i <= n; i++) {
        const coef = Number(binomial(n, i));
        sum += coef * Math.pow(x, n - i) * Math.pow(-1, i) * i * Math.pow(y, i - 1);
    }
    return sum;
}

export function integralXPowerX(x) {
    if (x <= 0) return 0;
    if (Math.abs(x - 1.0) < 1e-9) {
        return SOPHOMORE_CONSTANT;
    }
    const cuts = [0, 0.05 * x, 0.25 * x, 0.6 * x, x];
    let total = 0;
    for (let c = 0; c < cuts.length - 1; c++) {
        const a = cuts[c];
        const b = cuts[c + 1];
        const halfLength = (b - a) / 2;
        const midPoint = (b + a) / 2;
        let sum = 0;
        for (let i = 0; i < 16; i++) {
            const t = halfLength * GAUSS_NODES_16[i] + midPoint;
            const val = (t <= 0) ? 1.0 : Math.exp(t * Math.log(t));
            sum += GAUSS_WEIGHTS_16[i] * val;
        }
        total += halfLength * sum;
    }
    return total;
}

export function tanhSinhQuadrature(x, h = 0.1, maxK = 35) {
    if (x <= 0) return 0;
    const halfX = x / 2.0;
    let total = 0;
    for (let k = -maxK; k <= maxK; k++) {
        const u = k * h;
        const sinhU = Math.sinh(u);
        const coshU = Math.cosh(u);
        const arg = (Math.PI / 2.0) * sinhU;
        if (Math.abs(arg) > 30) continue;
        const coshArg = Math.cosh(arg);
        const tanhArg = Math.tanh(arg);
        const t = halfX * (1.0 + tanhArg);
        if (t <= 0 || t >= x) continue;
        const dtDu = halfX * (Math.PI / 2.0) * coshU / (coshArg * coshArg);
        const fVal = Math.exp(t * Math.log(t));
        total += fVal * dtDu;
    }
    return total * h;
}

export function generatePascalTriangle(maxN = 10) {
    const triangle = [];
    for (let n = 0; n <= maxN; n++) {
        const row = [];
        for (let k = 0; k <= n; k++) {
            row.push(binomial(n, k));
        }
        triangle.push(row);
    }
    return triangle;
}
