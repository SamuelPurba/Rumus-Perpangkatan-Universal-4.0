/**
 * SAMUEL.A.I - Complex Number & Generalized Binomial (x - y)^alpha
 * Rumus Perpangkatan Universal 4.0
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 */

export class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }

    add(c) { return new Complex(this.re + c.re, this.im + c.im); }
    sub(c) { return new Complex(this.re - c.re, this.im - c.im); }
    mul(c) {
        return new Complex(
            this.re * c.re - this.im * c.im,
            this.re * c.im + this.im * c.re
        );
    }
    scale(s) { return new Complex(this.re * s, this.im * s); }
    div(c) {
        const denom = c.re * c.re + c.im * c.im;
        if (denom === 0) throw new Error("Division by zero in complex arithmetic");
        return new Complex(
            (this.re * c.re + this.im * c.im) / denom,
            (this.im * c.re - this.re * c.im) / denom
        );
    }
    abs() { return Math.hypot(this.re, this.im); }
    arg() { return Math.atan2(this.im, this.re); }
    pow(alpha) {
        const r = this.abs();
        const phi = this.arg();
        if (r === 0) return new Complex(0, 0);
        const lnR = Math.log(r);
        const u = alpha.re * lnR - alpha.im * phi;
        const v = alpha.im * lnR + alpha.re * phi;
        const expU = Math.exp(u);
        return new Complex(expU * Math.cos(v), expU * Math.sin(v));
    }
    toString() {
        const sign = this.im >= 0 ? "+" : "-";
        return `${this.re.toFixed(5)} ${sign} ${Math.abs(this.im).toFixed(5)}i`;
    }
}

export function evaluateGeneralizedComplexBinomial(x, y, alpha, maxTerms = 60) {
    const diff = x.sub(y);
    const direct = diff.pow(alpha);
    const ratio = y.div(x);
    let seriesSum = new Complex(1, 0);
    let fallingFactorial = new Complex(1, 0);
    let factorial = 1;

    for (let k = 1; k < maxTerms; k++) {
        const alphaMinusPrev = alpha.sub(new Complex(k - 1, 0));
        fallingFactorial = fallingFactorial.mul(alphaMinusPrev);
        factorial *= k;
        const sign = (k % 2 === 0) ? 1 : -1;
        const coef = fallingFactorial.scale(sign / factorial);
        
        let ratioPower = new Complex(1, 0);
        for (let p = 0; p < k; p++) ratioPower = ratioPower.mul(ratio);
        
        const currentTerm = coef.mul(ratioPower);
        seriesSum = seriesSum.add(currentTerm);
        if (currentTerm.abs() < 1e-15) break;
    }

    const xPowAlpha = x.pow(alpha);
    const seriesVal = xPowAlpha.mul(seriesSum);

    return {
        direct: direct.toString(),
        series: seriesVal.toString(),
        error: direct.sub(seriesVal).abs(),
        converged: direct.sub(seriesVal).abs() < 1e-6
    };
}
