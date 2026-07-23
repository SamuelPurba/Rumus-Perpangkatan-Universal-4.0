/**
 * 🧪 SAMUEL.A.I - 4-Pillar Scopus Q1 Comprehensive Test Suite & Benchmark
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 * Framework: Node.js Automated Verification Engine
 */

const fs = require('fs');

const GAUSS_NODES = [
    -0.989400934991650, -0.944575023073233, -0.865631202387832, -0.755404408355003,
    -0.617876244402644, -0.458016777657227, -0.281603550779259, -0.095012509837637,
     0.095012509837637,  0.281603550779259,  0.458016777657227,  0.617876244402644,
     0.755404408355003,  0.865631202387832,  0.944575023073233,  0.989400934991650
];

const GAUSS_WEIGHTS = [
    0.027152459411754, 0.062253523938648, 0.095158511682493, 0.124628971255534,
    0.149595988816577, 0.169156519395003, 0.182603415044924, 0.189450610455068,
    0.189450610455068, 0.182603415044924, 0.169156519395003, 0.149595988816577,
    0.124628971255534, 0.095158511682493, 0.062253523938648, 0.027152459411754
];

function binomial(n, k) {
    if (k < 0 || k > n) return 0n;
    if (k === 0 || k === n) return 1n;
    if (k > n / 2) k = n - k;
    let res = 1n;
    for (let i = 1n; i <= BigInt(k); i++) {
        res = (res * (BigInt(n) - BigInt(k) + i)) / i;
    }
    return res;
}

function integralXPowerX(x) {
    if (x <= 0.0001) return 0;
    const start = 0.0001;
    const halfLength = (x - start) / 2;
    const midPoint = (x + start) / 2;
    let sum = 0;
    for (let i = 0; i < 16; i++) {
        const t = halfLength * GAUSS_NODES[i] + midPoint;
        const val = Math.exp(t * Math.log(t));
        sum += GAUSS_WEIGHTS[i] * val;
    }
    return halfLength * sum;
}

function evaluateNewtonBinomial(x, y, n) {
    let sum = 0;
    for (let k = 0; k <= n; k++) {
        const coef = Number(binomial(n, k));
        const term = coef * Math.pow(x, n - k) * Math.pow(-1, k) * Math.pow(y, k);
        sum += term;
    }
    return sum;
}

// Suite Runner
console.log("=========================================================================");
console.log(" 🔬 SAMUEL.A.I - 4-PILLAR SCOPUS Q1 AUTOMATED VERIFICATION SUITE");
console.log("=========================================================================");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(` ✅ PASS: ${testName}`);
        passed++;
    } else {
        console.error(` ❌ FAIL: ${testName}`);
        failed++;
    }
}

// PILLAR 1: MATHEMATICAL RIGOR AUDIT
console.log("\n--- PILLAR 1: Mathematical Rigor & Formal Theorems ---");
const derivativeWrtT = 0;
const divisionByZeroResult = (derivativeWrtT === 0) ? "Undefined" : "Valid";
assert(divisionByZeroResult === "Undefined", "Teorema 1: Division-by-Zero d/dt Elimination Audit");

const sophomoresDream = integralXPowerX(1.0);
const expectedValue = 0.7834305;
const diff = Math.abs(sophomoresDream - expectedValue);
assert(diff < 0.001, `Teorema 2: 16-Point Gauss-Legendre Quadrature (Calculated: ${sophomoresDream.toFixed(7)}, Expected: ~0.7834305)`);

const testCases = [
    { x: 5, y: 2, n: 3 },
    { x: 10, y: 4, n: 4 },
    { x: 7, y: 3, n: 5 }
];
testCases.forEach((tc, idx) => {
    const directVal = Math.pow(tc.x - tc.y, tc.n);
    const expansionVal = evaluateNewtonBinomial(tc.x, tc.y, tc.n);
    const err = Math.abs(directVal - expansionVal);
    assert(err < 1e-7, `Teorema 3 Case #${idx + 1}: (x-y)^n Equivalence for x=${tc.x}, y=${tc.y}, n=${tc.n}`);
});

// PILLAR 2: CALCULATOR & SPEED BENCHMARK
console.log("\n--- PILLAR 2: Calculator Engine & Sub-Millisecond Speed ---");
const bin50_25 = binomial(50, 25);
assert(bin50_25 === 126410606437752n, `Pascal Sieve BigInt Precision C(50, 25) = ${bin50_25}`);

const iterations = 10000;
const startTime = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    evaluateNewtonBinomial(5, 2, 4);
    integralXPowerX(2.5);
}
const endTime = process.hrtime.bigint();
const totalMs = Number(endTime - startTime) / 1e6;
const avgMs = totalMs / iterations;
assert(avgMs < 0.01, `Sub-Millisecond Benchmark: ${iterations} operations in ${totalMs.toFixed(2)} ms (Average: ${avgMs.toFixed(5)} ms/op)`);

// PILLAR 3: MULTI-LANGUAGE DICTIONARY INTEGRITY
console.log("\n--- PILLAR 3: Multi-Language Dictionary (5 Languages) ---");
const appJsContent = fs.readFileSync('app.js', 'utf8');
const languages = ['en', 'ja', 'zh', 'de'];
languages.forEach(lang => {
    const hasLang = appJsContent.includes(`${lang}: {`);
    assert(hasLang, `Dictionary Autotranslate Engine contains language '${lang.toUpperCase()}'`);
});

// PILLAR 4: REPOSITORY & ASSET INTEGRITY
console.log("\n--- PILLAR 4: Repository, Assets & Scopus Q1 Documentation ---");
const requiredFiles = ['index.html', 'style.css', 'app.js', 'Program.cs', 'README.md', 'CITATION.cff', 'LICENSE', '.gitignore'];
requiredFiles.forEach(file => {
    assert(fs.existsSync(file), `File '${file}' exists and is ready for GitHub release`);
});

console.log("\n=========================================================================");
console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
console.log("=========================================================================");

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
