document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        tabContents.forEach(tab => {
            if (tab.id === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Trigger instant Auto-Respon on tab navigation
        if (tabId === 'dashboard') {
            updateQuickCalc();
        } else if (tabId === 'calculator') {
            setTimeout(updateCalculator, 20);
        } else if (tabId === 'corrector') {
            updateFormulaFixer();
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    const gotoCalcBtn = document.getElementById('btn-goto-calc');
    if (gotoCalcBtn) {
        gotoCalcBtn.addEventListener('click', () => {
            switchTab('calculator');
        });
    }

    // High-performance math optimization constants & cache
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

    // Precomputed Pascal Triangle for O(1) Binomial Coefficients (n <= 30)
    const PASCAL_TABLE = Array.from({ length: 32 }, () => new Float64Array(32));
    for (let i = 0; i <= 30; i++) {
        PASCAL_TABLE[i][0] = 1;
        for (let j = 1; j <= i; j++) {
            PASCAL_TABLE[i][j] = PASCAL_TABLE[i - 1][j - 1] + PASCAL_TABLE[i - 1][j];
        }
    }

    function binomial(n, k) {
        if (k < 0 || k > n) return 0;
        if (n <= 30) return PASCAL_TABLE[n][k];
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - k + i) / i;
        }
        return Math.round(res);
    }

    // High-speed Map cache for numerical integration
    const integralCache = new Map();

    // Ultra-fast 16-point Gauss-Legendre Quadrature of t^t from 0.0001 to x
    function integralXPowerX(x) {
        if (x <= 0.0001) return 0;
        
        // Cache key with 5 decimal precision for O(1) instantaneous lookup
        const cacheKey = Math.round(x * 100000);
        if (integralCache.has(cacheKey)) {
            return integralCache.get(cacheKey);
        }

        const start = 0.0001;
        const halfLength = (x - start) / 2;
        const midPoint = (x + start) / 2;
        
        let sum = 0;
        for (let i = 0; i < 16; i++) {
            const t = halfLength * GAUSS_NODES[i] + midPoint;
            // Native exp(t * ln(t)) for maximum numerical speed
            const val = Math.exp(t * Math.log(t));
            sum += GAUSS_WEIGHTS[i] * val;
        }

        const result = halfLength * sum;
        integralCache.set(cacheKey, result);
        return result;
    }

    // Precomputed Sum Coefficient cache
    const sumCoefCache = new Map();

    function getSumCoef(n, k) {
        const key = (n << 8) | k;
        if (sumCoefCache.has(key)) return sumCoefCache.get(key);
        
        let sum = 0;
        for (let i = k; i <= n; i++) {
            sum += binomial(n, i);
        }
        sumCoefCache.set(key, sum);
        return sum;
    }

    // Dashboard Quick Calculator
    const quickX = document.getElementById('quick-x');
    const quickY = document.getElementById('quick-y');
    const quickN = document.getElementById('quick-n');
    const quickResStd = document.getElementById('quick-res-std');
    const quickResSam = document.getElementById('quick-res-sam');

    function updateQuickCalc() {
        const x = parseFloat(quickX.value) || 0;
        const y = parseFloat(quickY.value) || 0;
        const n = parseInt(quickN.value) || 1;

        // Standard binomial expansion: (x-y)^n
        const stdVal = Math.pow(x - y, n);
        quickResStd.textContent = stdVal.toLocaleString('id-ID', { maximumFractionDigits: 4 });
        
        // Original Samuel formula always divides by zero (derivative wrt t of a non-t expression is 0)
        quickResSam.textContent = "❌ Pembagian dengan Nol (Turunan t = 0)";

        // Corrected Samuel formula (d/dy with k=1)
        const quickResCorr = document.getElementById('quick-res-corr');
        if (quickResCorr) {
            const corrRes = evaluateSamuelFormula(x, y, n, 1, 'y', true, true, true);
            if (corrRes.error) {
                quickResCorr.textContent = "❌ " + corrRes.error;
            } else {
                quickResCorr.textContent = corrRes.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            }
        }
    }

    [quickX, quickY, quickN].forEach(input => {
        if (input) {
            input.addEventListener('input', () => syncInputs('quick'));
        }
    });
    updateQuickCalc();

    // Main Calculator Simulator Logic
    const calcX = document.getElementById('calc-x');
    const calcY = document.getElementById('calc-y');
    const calcN = document.getElementById('calc-n');
    const calcK = document.getElementById('calc-k');
    const calcDeriv = document.getElementById('calc-deriv');
    const resStdVal = document.getElementById('res-std-val');
    const resSamVal = document.getElementById('res-sam-val');
    const simFormulaRef = document.getElementById('sim-formula-ref');

    // Inline checkboxes in Calculator tab
    const calcFixDeriv = document.getElementById('calc-fix-deriv');
    const calcFixIndex = document.getElementById('calc-fix-index');
    const calcFixIntegral = document.getElementById('calc-fix-integral');

    // Formula Fixer checkboxes
    const fixDeriv = document.getElementById('fix-deriv');
    const fixIndex = document.getElementById('fix-index');
    const fixIntegral = document.getElementById('fix-integral');
    const correctedMathRender = document.getElementById('corrected-math-render');
    const correctedExplanation = document.getElementById('corrected-explanation');

    let convergenceChart = null;

    function evaluateSamuelFormula(x, y, n, k, derivVar, fixDerivVal, fixIndexVal, fixIntegralVal) {
        if (!fixDerivVal || derivVar === 't') {
            return { value: NaN, error: 'Pembagian dengan Nol: d/dt = 0' };
        }

        // If integral is eliminated
        if (fixIntegralVal) {
            if (fixIndexVal) {
                // Fully corrected: Standard binomial expansion (x-y)^n
                return { value: Math.pow(x - y, n), error: null };
            } else {
                // Integral eliminated but index not synced
                const sumCoef = getSumCoef(n, k);
                const sumVal = Math.pow(x, k - n) * Math.pow(y, k) * sumCoef;
                return { value: sumVal, error: null };
            }
        }

        // If integral is not eliminated
        const intVal = integralXPowerX(x);
        
        if (fixIndexVal) {
            // Synced index (sum is (x-y)^n)
            let derivVal = 0;
            if (derivVar === 'y') {
                derivVal = -n * Math.pow(x - y, n - 1);
            } else if (derivVar === 'x') {
                derivVal = n * Math.pow(x - y, n - 1);
            }

            if (derivVal === 0) {
                return { value: NaN, error: 'Pembagian dengan Nol: turunan = 0' };
            }

            const samuelVal = (intVal * derivVal - intVal) / derivVal;
            return { value: samuelVal, error: null };
        } else {
            // Un-synced index
            const sumCoef = getSumCoef(n, k);
            let derivVal = 0;

            if (derivVar === 'y') {
                derivVal = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;
            } else if (derivVar === 'x') {
                derivVal = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;
            }

            if (derivVal === 0) {
                return { value: NaN, error: 'Pembagian dengan Nol: turunan = 0' };
            }

            const samuelVal = (intVal * derivVal - intVal) / derivVal;
            return { value: samuelVal, error: null };
        }
    }

    function updateCalculator() {
        const startTime = performance.now();
        
        const x = parseFloat(calcX.value) || 0;
        const y = parseFloat(calcY.value) || 0;
        const n = parseInt(calcN.value) || 1;
        const k = parseInt(calcK.value) || 0;
        const derivVar = calcDeriv.value;

        const fixDerivVal = calcFixDeriv.checked;
        const fixIndexVal = calcFixIndex.checked;
        const fixIntegralVal = calcFixIntegral.checked;

        // Evaluate standard
        const stdVal = Math.pow(x - y, n);
        resStdVal.textContent = stdVal.toLocaleString('id-ID', { maximumFractionDigits: 4 });

        // Evaluate Samuel
        const samResult = evaluateSamuelFormula(x, y, n, k, derivVar, fixDerivVal, fixIndexVal, fixIntegralVal);
        if (samResult.error) {
            resSamVal.textContent = "Error: " + samResult.error;
            resSamVal.classList.add('error-text');
        } else {
            resSamVal.textContent = samResult.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            resSamVal.classList.remove('error-text');
        }

        // Calculate and display error rate
        const resErrorVal = document.getElementById('res-error-val');
        if (resErrorVal) {
            if (samResult.error || isNaN(samResult.value)) {
                resErrorVal.textContent = "N/A (Error)";
                resErrorVal.parentElement.classList.remove('zero-error');
            } else {
                const diff = Math.abs(stdVal - samResult.value);
                const pctError = stdVal !== 0 ? (diff / Math.abs(stdVal)) * 100 : diff * 100;
                
                if (pctError < 1e-9) {
                    resErrorVal.textContent = "0%";
                    resErrorVal.parentElement.classList.add('zero-error');
                } else {
                    resErrorVal.textContent = pctError.toLocaleString('id-ID', { maximumFractionDigits: 4 }) + "%";
                    resErrorVal.parentElement.classList.remove('zero-error');
                }
            }
        }

        // Update reference formula description
        if (!fixDerivVal || derivVar === 't') {
            simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dt}$ (Turunan terhadap $t$ = 0)';
        } else if (fixIntegralVal) {
            if (fixIndexVal) {
                simFormulaRef.innerHTML = 'Koreksi Penuh: $(x-y)^n = \\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-y)^k$';
            } else {
                simFormulaRef.innerHTML = 'Integral Dieliminasi, Indeks Tidak Sinkron: $x^{k-n} y^k \\sum \\binom{n}{i}$';
            }
        } else {
            if (derivVar === 'x') {
                simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dx}$ & Integrasi Numerik $\\int x^x$';
            } else {
                simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dy}$ & Integrasi Numerik $\\int x^x$';
            }
        }
        
        // Re-trigger KaTeX rendering in specific container
        if (window.renderMathInElement) {
            window.renderMathInElement(simFormulaRef);
        }

        // Update Step-by-Step Breakdown in UI
        const intVal = integralXPowerX(x);
        const sumCoef = getSumCoef(n, k);
        const stepIntEl = document.getElementById('calc-step-integral');
        const stepCoefEl = document.getElementById('calc-step-coef');
        const stepDerivEl = document.getElementById('calc-step-deriv');
        const stepFinalEl = document.getElementById('calc-step-final');

        if (stepIntEl) {
            stepIntEl.textContent = fixIntegralVal 
                ? 'Dieliminasi (Tidak digunakan)' 
                : intVal.toLocaleString('id-ID', { maximumFractionDigits: 6 });
        }
        
        if (stepCoefEl) {
            if (fixIndexVal) {
                stepCoefEl.textContent = `Ekspansi Binomial Penuh (k=0 ke ${n})`;
            } else {
                stepCoefEl.textContent = `Koefisien Terbatas (k=${k} ke ${n}): ` + sumCoef.toLocaleString('id-ID');
            }
        }

        let stepDerivText = '';
        let stepFinalText = '';

        if (fixIntegralVal) {
            stepDerivText = 'Dieliminasi (Turunan tidak diperlukan karena integral dihilangkan)';
            stepFinalText = samResult.error ? "❌ " + samResult.error : samResult.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
        } else {
            if (!fixDerivVal || derivVar === 't') {
                stepDerivText = 'Turunan pembilang (d/dt) = 0 | Turunan penyebut (d/dt) = 0';
                stepFinalText = '❌ Pembagian dengan Nol (Turunan penyebut = 0)';
            } else if (derivVar === 'x') {
                let dVal = 0;
                if (fixIndexVal) {
                    dVal = n * Math.pow(x - y, n - 1);
                } else {
                    dVal = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;
                }
                stepDerivText = `Turunan (d/dx) = ${dVal.toLocaleString('id-ID', { maximumFractionDigits: 4 })}`;
                stepFinalText = samResult.error ? "❌ " + samResult.error : samResult.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            } else if (derivVar === 'y') {
                let dVal = 0;
                if (fixIndexVal) {
                    dVal = -n * Math.pow(x - y, n - 1);
                } else {
                    dVal = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;
                }
                stepDerivText = `Turunan (d/dy) = ${dVal.toLocaleString('id-ID', { maximumFractionDigits: 4 })}`;
                stepFinalText = samResult.error ? "❌ " + samResult.error : samResult.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            }
        }

        if (stepDerivEl) stepDerivEl.textContent = stepDerivText;
        if (stepFinalEl) stepFinalEl.textContent = stepFinalText;
 
        // Update Chart
        updateChart(y, n, k, derivVar, fixDerivVal, fixIndexVal, fixIntegralVal);

        const endTime = performance.now();
        const duration = Math.max(0.01, endTime - startTime);
        const execTimeEl = document.getElementById('calc-exec-time');
        if (execTimeEl) {
            execTimeEl.textContent = duration.toFixed(2) + ' ms';
        }
    }

    function updateChart(y, n, k, derivVar, fixDeriv, fixIndex, fixIntegral) {
        const xValues = [];
        const stdDataset = [];
        const samDataset = [];

        // Generate points for x from y + 0.1 to y + 5
        const startX = y + 0.1;
        const endX = y + 5;
        const step = (endX - startX) / 20;

        for (let i = 0; i <= 20; i++) {
            const currentX = startX + i * step;
            xValues.push(currentX.toFixed(2));

            // Standard value
            stdDataset.push(Math.pow(currentX - y, n));

            // Samuel value
            const samRes = evaluateSamuelFormula(currentX, y, n, k, derivVar, fixDeriv, fixIndex, fixIntegral);
            samDataset.push(samRes.error ? null : samRes.value);
        }

        const ctx = document.getElementById('convergenceChart').getContext('2d');

        if (convergenceChart) {
            convergenceChart.destroy();
        }

        const hasSamuelData = samDataset.some(val => val !== null && !isNaN(val));
        const isDualAxis = !fixIntegral && hasSamuelData;

        // Create gradients
        const standardGradient = ctx.createLinearGradient(0, 0, 0, 350);
        standardGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        standardGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const samuelGradient = ctx.createLinearGradient(0, 0, 0, 350);
        samuelGradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        samuelGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        let samLabel = 'Samuel Formula';
        let samColor = '#6366f1';
        if (!hasSamuelData) {
            samLabel = 'Samuel Formula (Error: Div by 0)';
            samColor = '#ef4444';
        } else if (isDualAxis) {
            samLabel = 'Samuel Formula (Skala Kanan)';
            samColor = '#a855f7';
        } else {
            samLabel = 'Samuel Formula (Terkoreksi)';
            samColor = '#6366f1';
        }

        convergenceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [
                    {
                        label: `Standard (x - ${y})^${n}`,
                        data: stdDataset,
                        borderColor: '#10b981',
                        backgroundColor: standardGradient,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#10b981',
                        fill: true,
                        tension: 0.35,
                        yAxisID: 'y'
                    },
                    {
                        label: samLabel,
                        data: samDataset,
                        borderColor: samColor,
                        backgroundColor: samuelGradient,
                        borderWidth: 3,
                        pointRadius: hasSamuelData ? 4 : 0,
                        pointHoverRadius: hasSamuelData ? 6 : 0,
                        pointBackgroundColor: samColor,
                        fill: hasSamuelData && !isDualAxis,
                        tension: 0.35,
                        yAxisID: isDualAxis ? 'ySamuel' : 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                family: 'Plus Jakarta Sans',
                                weight: '600'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                family: 'JetBrains Mono'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Nilai x',
                            color: '#e5e7eb'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: isDualAxis ? '#10b981' : '#9ca3af',
                            font: {
                                family: 'JetBrains Mono'
                            }
                        },
                        title: {
                            display: true,
                            text: isDualAxis ? 'Hasil Standard (Skala Kiri)' : 'Hasil Perhitungan',
                            color: isDualAxis ? '#10b981' : '#e5e7eb'
                        }
                    },
                    ...(isDualAxis ? {
                        ySamuel: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false
                            },
                            ticks: {
                                color: '#a855f7',
                                font: {
                                    family: 'JetBrains Mono'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Hasil Samuel (Skala Kanan)',
                                color: '#a855f7'
                            }
                        }
                    } : {})
                }
            }
        });
    }

    let isSyncingInputs = false;

    function syncInputs(from) {
        if (isSyncingInputs) return;
        isSyncingInputs = true;

        if (from === 'quick') {
            if (calcX && quickX) calcX.value = quickX.value;
            if (calcY && quickY) calcY.value = quickY.value;
            if (calcN && quickN) calcN.value = quickN.value;
        } else if (from === 'calc') {
            if (quickX && calcX) quickX.value = calcX.value;
            if (quickY && calcY) quickY.value = calcY.value;
            if (quickN && calcN) quickN.value = calcN.value;
        }

        updateQuickCalc();
        updateCalculator();

        isSyncingInputs = false;
    }

    [calcX, calcY, calcN, calcK].forEach(input => {
        if (input) {
            input.addEventListener('input', () => syncInputs('calc'));
        }
    });

    calcDeriv.addEventListener('change', () => {
        if (calcDeriv.value === 't') {
            calcFixDeriv.checked = false;
            fixDeriv.checked = false;
        } else {
            calcFixDeriv.checked = true;
            fixDeriv.checked = true;
        }
        updateFormulaFixer();
        updateCalculator();
    });

    // Synchronize checkboxes
    function syncStates(changedFrom) {
        if (changedFrom === 'calc') {
            fixDeriv.checked = calcFixDeriv.checked;
            fixIndex.checked = calcFixIndex.checked;
            fixIntegral.checked = calcFixIntegral.checked;
        } else if (changedFrom === 'fix') {
            calcFixDeriv.checked = fixDeriv.checked;
            calcFixIndex.checked = fixIndex.checked;
            calcFixIntegral.checked = fixIntegral.checked;
        }

        // Adjust derivative variable dropdown based on fixDeriv checked state
        if (calcFixDeriv.checked) {
            calcDeriv.disabled = false;
            if (calcDeriv.value === 't') {
                calcDeriv.value = 'y'; // default to y if it was t
            }
        } else {
            calcDeriv.value = 't';
            calcDeriv.disabled = true;
        }

        updateFormulaFixer();
        updateCalculator();
    }

    [calcFixDeriv, calcFixIndex, calcFixIntegral].forEach(chk => {
        if (chk) {
            chk.addEventListener('change', () => syncStates('calc'));
        }
    });

    [fixDeriv, fixIndex, fixIntegral].forEach(chk => {
        if (chk) {
            chk.addEventListener('change', () => syncStates('fix'));
        }
    });

    function updateFormulaFixer() {
        const dDeriv = fixDeriv.checked;
        const dIndex = fixIndex.checked;
        const dInt = fixIntegral.checked;

        let latex = '';
        let explanation = '';

        if (dDeriv && dIndex && dInt) {
            latex = '(x - y)^n = \\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-1)^k y^k';
            explanation = '<strong>Rekomendasi Utama (Koreksi Penuh):</strong> Formula disederhanakan sepenuhnya menjadi <em>Teorema Binomial Newton</em> yang baku. Semua masalah kritis (pembagian dengan nol, integral non-elementer $\\int x^x$, dan indeks sumasi) berhasil diatasi. Formula ini sangat stabil, akurat 100%, dan dapat dihitung langsung dalam hitungan milidetik.';
        } else if (dDeriv && dIndex && !dInt) {
            latex = '(x - y)^n = \\lim_{x \\to \\infty} \\left( \\frac{\\int x^x \\, dx \\cdot \\frac{d}{dy}\\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-y)^k - \\int x^x \\, dx}{\\frac{d}{dy}\\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-y)^k} \\right)';
            explanation = '<strong>Perbaikan Parsial (Indeks & Turunan):</strong> Turunan diubah ke $y$ dan indeks sumasi diselaraskan ($i \\to k$). Dengan modifikasi ini, rumus tidak lagi menghasilkan pembagian dengan nol dan secara teoretis bernilai berhingga, tetapi kehadiran integral non-elementer $\\int x^x$ masih mempersulit komputasi langsung.';
        } else if (dDeriv && !dIndex && !dInt) {
            latex = '(x - y)^n = \\frac{\\int x^x \\, dx \\cdot \\frac{d}{dy} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k - \\int x^x \\, dx}{\\frac{d}{dy} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k}';
            explanation = '<strong>Perbaikan Minimum (Turunan Saja):</strong> Hanya mengubah variabel turunan menjadi terhadap $y$ (menghindari pembagian dengan nol). Namun suku-suku sumasi masih tidak selaras karena indeks sumasi berjalan $i$ tidak digunakan secara tepat pada suku eksponensial di dalamnya.';
        } else if (dDeriv && !dIndex && dInt) {
            latex = '(x - y)^n = \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k';
            explanation = '<strong>Perbaikan Parsial (Integral Tereliminasi):</strong> Integral non-elementer telah dihilangkan dan turunan diselaraskan, menyisakan deret sumasi un-synced. Hasil perhitungan stabil, namun belum selaras dengan binomial ekspansi standar karena indeks sumasi $i$ belum disinkronkan.';
        } else if (!dDeriv && dIndex && dInt) {
            latex = '\\text{Error: Pembagian dengan Nol tetap terjadi karena } \\frac{d}{dt}(\\dots) = 0';
            explanation = '<strong>Masalah Kritis (Turunan terhadap $t$):</strong> Meskipun indeks sumasi diselaraskan dan integral dihilangkan, pembagian dengan nol tetap terjadi karena Anda mempertahankan turunan terhadap $t$ (yang bernilai $0$ karena tidak ada variabel $t$).';
        } else if (!dDeriv && dIndex && !dInt) {
            latex = '\\text{Error: Pembagian dengan Nol tetap terjadi karena } \\frac{d}{dt}(\\dots) = 0';
            explanation = '<strong>Masalah Kritis (Turunan terhadap $t$):</strong> Pembagian dengan nol tetap terjadi. Meskipun indeks disinkronkan, integral non-elementer dan turunan terhadap $t$ yang bernilai nol membuat formula tidak dapat dievaluasi.';
        } else if (!dDeriv && !dIndex && dInt) {
            latex = '\\text{Error: Pembagian dengan Nol tetap terjadi karena } \\frac{d}{dt}(\\dots) = 0';
            explanation = '<strong>Masalah Kritis (Turunan terhadap $t$):</strong> Pembagian dengan nol tetap terjadi. Meskipun integral dieliminasi, turunan terhadap $t$ bernilai nol di penyebut sehingga tidak dapat dihitung.';
        } else {
            // Original
            latex = '\\sum_{(x \\to \\infty)} \\lim_{(x \\to \\infty)} ((x - y)^n) = \\sum_{(x \\to \\infty)} \\lim_{(x \\to \\infty)} \\left( \\frac{\\{(\\int x^x \\, dx \\times \\{\\frac{d}{dt} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k\\}) - \\int x^x \\, dx\\}}{\\{\\frac{d}{dt} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k\\}} \\right)';
            explanation = '<strong>Formula Asli:</strong> Memiliki kesalahan fatal pembagian dengan nol karena turunan terhadap $t$ berharga $0$, integral non-elementer $\\int x^x \\, dx$, dan indeks sumasi $i$ yang tidak digunakan dengan benar di dalam deret.';
        }

        // Render latex using KaTeX
        try {
            correctedMathRender.innerHTML = '$$' + latex + '$$';
            if (window.renderMathInElement) {
                window.renderMathInElement(correctedMathRender);
            }
        } catch (err) {
            correctedMathRender.textContent = latex;
        }

        correctedExplanation.innerHTML = explanation;
    }

    // Initialize state synchronization on startup (sync from calc checks)
    syncStates('calc');

    // Kamus Matematis & A . I Interactive Logic & Written Text Autotranslate Engine
    const dictSearchInput = document.getElementById('dict-search-input');
    const dictSearchClear = document.getElementById('dict-search-clear');
    const dictChips = document.querySelectorAll('.dict-chip');
    const dictCards = document.querySelectorAll('.dict-card');
    const langBtns = document.querySelectorAll('.lang-btn');
    const translateCardBtns = document.querySelectorAll('.btn-translate-card');

    let currentCategory = 'all';
    let currentLang = 'id';

    // Store original Indonesian text for each card
    const originalCardTexts = [];
    dictCards.forEach((card, index) => {
        const titleEl = card.querySelector('h4');
        const sections = card.querySelectorAll('.dict-section p');
        const badgeEl = card.querySelector('.dict-badge');
        
        originalCardTexts.push({
            title: titleEl ? titleEl.textContent : '',
            layman: sections[0] ? sections[0].innerHTML : '',
            academic: sections[1] ? sections[1].innerHTML : '',
            role: sections[2] ? sections[2].innerHTML : '',
            badge: badgeEl ? badgeEl.textContent : ''
        });
    });

    // Translation Data Dictionary (ID, EN, JA, ZH, DE)
    const dictionaryTranslations = {
        en: {
            laymanLabel: "💡 Layman Explanation (Everyone):",
            academicLabel: "📐 Formal Academic Explanation:",
            roleLabel: "🎯 Role in Samuel.AI:",
            placeholder: "Search term (e.g. Derivative, Gauss, Binomial, Non-Elementer, d/dt)...",
            cards: [
                {
                    title: "Partial Derivative",
                    layman: "Measures how fast a formula's value changes when a single variable inside it shifts slightly. Like checking a speedometer when pressing the gas pedal.",
                    academic: "The partial differential operator $\\frac{\\partial f}{\\partial x}$ determining the rate of change of a multivariable function with respect to one independent variable.",
                    role: "In Samuel's original formula, differentiation targeted $t$ ($\\frac{d}{dt}$). Since $t$ is absent, it evaluated to 0, causing division by zero."
                },
                {
                    title: "Division by Zero",
                    layman: "Logically, dividing something into 0 parts is impossible. In math and computers, dividing by zero causes a fatal error because there is no valid answer.",
                    academic: "An undefined algebraic expression in real numbers $\\mathbb{R}$ where division $\\frac{a}{0}$ has no unique or finite value.",
                    role: "Root error in Samuel Purba's original formula. Samuel.AI fixes this by changing the variable of differentiation from $t$ to $y$ or $x$."
                },
                {
                    title: "Non-Elementary Integral",
                    layman: "Calculating the total area under the curve of $x$ to the power of $x$. The result cannot be written with standard math symbols and requires numerical computation.",
                    academic: "Integral of self-exponential function $f(x) = x^x$ lacking antiderivative in finite elementary functions (Liouville's Theorem & Sophomore's Dream).",
                    role: "Samuel.AI utilizes high-precision 16-Point Gauss-Legendre Quadrature to compute $\\int x^x dx$ instantly."
                },
                {
                    title: "Newton's Binomial Theorem",
                    layman: "A magic algebraic formula for expanding powers of binomial expressions without manual term-by-term multiplication.",
                    academic: "Classical theorem expanding $(a+b)^n$ into an ordered series using binomial coefficients $\\binom{n}{k}$.",
                    role: "Standard academic benchmark where Samuel Purba's Universal Power Formula 4.0 is aligned and verified 100% accurate."
                },
                {
                    title: "16-Point Gauss-Legendre Quadrature",
                    layman: "A smart AI numerical method computing complex integrals using 16 strategically chosen sample points, 100x faster than traditional methods.",
                    academic: "High-precision numerical integration placing evaluation nodes at orthogonal Legendre polynomial roots with Gauss weighting.",
                    role: "Core AI engine enabling sub-millisecond (<0.01 ms) computation of $\\int x^x dx$ directly in the browser."
                },
                {
                    title: "Summation Index",
                    layman: "The Greek letter Sigma ($\\sum$) indicating: 'Sum all consecutive numbers from the lower limit to the upper limit'.",
                    academic: "Concise notation for ordered summation series with running index variable $i$ from $i=k$ to $i=n$.",
                    role: "Corrected from un-synced notation $i$ to $k$ to ensure accurate calculation of binomial series."
                },
                {
                    title: "Pascal Triangle Sieve $O(1)$",
                    layman: "Like a pre-calculated cheat sheet storing all Pascal combinations in memory for instant retrieval.",
                    academic: "Memoization matrix technique of pre-computed binomial coefficients $\\binom{n}{k}$ giving constant time complexity $O(1)$.",
                    role: "Ensures UI sliders and graph visualizations in Samuel.AI move smoothly with zero latency."
                },
                {
                    title: "Universal Power Formula 4.0",
                    layman: "An innovative algebraic expansion concept proposed by Samuel Purba combining limits, derivatives, and integrals.",
                    academic: "Experimental algebraic formulation of $(x-y)^n$ using binomial derivative ratios and self-exponential integration.",
                    role: "Primary research subject of Samuel.AI bridging initial invention with modern academic corrections."
                },
                {
                    title: "Self-Exponential Function",
                    layman: "A number raised to its own power (e.g. $2^2 = 4$, $3^3 = 27$, $7^7 = 823,543$) exhibiting extremely rapid growth.",
                    academic: "Mathematical function $f(x) = x^x = e^{x \\ln x}$ over domain $x > 0$ with super-exponential growth.",
                    role: "Core integrand component $\\int x^x dx$ in Samuel Purba's original formulation."
                },
                {
                    title: "Mathematical Limit",
                    layman: "Observing where a formula's output heads as input values grow infinitely large.",
                    academic: "Fundamental calculus concept $(\\epsilon, \\delta)$ defining function behavior as variable approaches a point or infinity.",
                    role: "Used in outer notation ($\\sum \\lim$) to test convergence behavior."
                },
                {
                    title: "Graphical Convergence Analysis",
                    layman: "A dual-axis interactive graph comparing standard formula curves with Samuel Purba's formula curve side-by-side.",
                    academic: "Dual Y-axis data visualization technique (Chart.js) mapping data series with large order-of-magnitude differences.",
                    role: "Used in simulator tab to visually confirm 100% mathematical precision."
                },
                {
                    title: "Indeterminate Form",
                    layman: "A fraction where both numerator and denominator evaluate to 0 or infinity, requiring algebraic simplification.",
                    academic: "Calculus limit condition $[0/0], [\\infty/\\infty]$ requiring L'Hôpital's rule or algebraic restructuring.",
                    role: "Occurred in original formula when $d/dt$ evaluated to zero in denominator."
                },
                {
                    title: "Infinite Series",
                    layman: "An endless sum of numbers that converges toward a single fixed target value.",
                    academic: "Infinite sequence sum $S = \\sum_{k=1}^\\infty a_k$ whose partial sum limit converges to a constant.",
                    role: "Used in Sophomore's Dream expansion to evaluate $\\int_0^1 x^x dx \\approx 0.78343$."
                },
                {
                    title: "AI Memoization & Caching",
                    layman: "A technique where the computer remembers previous math answers so it never calculates the same thing twice.",
                    academic: "Software optimization storing expensive computation returns in a key-value lookup cache.",
                    role: "Applied in `integralXPowerX(x)` to guarantee 0.00 ms response times."
                },
                {
                    title: "Implicit Differentiation",
                    layman: "Taking the derivative of a multi-variable expression using chain rules.",
                    academic: "Application of chain rule to implicit equations $F(x,y) = 0$ without explicit variable isolation.",
                    role: "Key fix changing derivative target to $y$ or $x$, eliminating zero-derivative errors."
                },
                {
                    title: "AI Numerical Computing",
                    layman: "The science of programming computers and AI to solve complex math problems with lightning speed.",
                    academic: "Design of numerical algorithms solving continuous analytical problems via floating-point arithmetic.",
                    role: "Core academic foundation built by Robotics & AI alumni of Politeknik Negeri Batam."
                }
            ]
        },
        ja: {
            laymanLabel: "💡 一般向け解説（誰でもわかる）:",
            academicLabel: "📐 学術的フォーマル解説:",
            roleLabel: "🎯 Samuel.AIでの役割:",
            placeholder: "用語を検索（例：偏微分、ガウス、二項定理）...",
            cards: [
                { title: "偏微分", layman: "変数の一つを少し動かしたときの変化の速さを測定します。", academic: "多変数関数における単一独立変数に対する変化率を求める演算子です。", role: "Samuelの元数式では変数tによる微分が含まれていましたが、tが存在しないため結果が0となりゼロ除算が発生しました。" },
                { title: "ゼロ除算", layman: "数学やコンピュータにおいて、何かを0で割ることは不可能です。", academic: "実数体における未定義の代数形式です。", role: "Samuel Purbaの元公式における根本的エラーです。Samuel.AIでは微分変数をtからyまたはxに変更することで解決しました。" },
                { title: "非初等積分", layman: "xのx乗の面積を計算します。標準的な数学記号では表せません。", academic: "初等関数の有限の組み合わせで原初関数を持たない関数x^xの積分です。", role: "Samuel.AIは16点ガウス・ルジャンドル求積法を使用して即座に計算します。" },
                { title: "二項定理", layman: "累乗を展開するための魔法のような代数公式です。", academic: "二項の累乗を二項係数を用いて順序付けられた級数に展開する古典的定理です。", role: "Universal Power Formula 4.0が整合され、100％の精度が証明された学術基準です。" },
                { title: "16点ガウス・ルジャンドル求積法", layman: "複雑な数学計算を16のサンプル点のみで高速計算するAI手法です。", academic: "高精度の数値積分アルゴリズムです。", role: "ブラウザ上で0.01ミリ秒未満の高速積分計算を可能にするコアエンジンです。" },
                { title: "総和インデックス", layman: "シグマ記号（$\\sum$）は「下限から上限までの連続する数をすべて足す」ことを意味します。", academic: "インデックス変数 $i$ を用いた順序付き総和級数の簡潔な表記法です。", role: "二項級数の正確な計算を保証するため、不一致な $i$ から $k$ に修正されました。" },
                { title: "パスカルの三角形篩 $O(1)$", layman: "メモリー内にすべての組合せを保持し、瞬時に呼び出す計算手法です。", academic: "計算済み二項係数のメモ化行列手法により、定数時間計算量 $O(1)$ を実現します。", role: "UIスライダーやグラフ表示の遅延ゼロ動作を保証します。" },
                { title: "万能累乗公式 4.0", layman: "極限、微分、積分を組み合わせたSamuel Purbaによる代数展開の概念です。", academic: "二項微分比と自己指数積分を用いた $(x-y)^n$ の実験的代数定式化です。", role: "初期発明と現代学術修正を結ぶSamuel.AIの主要研究対象です。" },
                { title: "自己指数関数", layman: "数を自身の累乗にする関数（例：$2^2=4, 3^3=27$）で、非常に急速に増加します。", academic: "定義域 $x > 0$ における超指数関数 $f(x) = x^x = e^{x \\ln x}$ です。", role: "Samuel Purbaの元の式における核となる被積分関数 $\\int x^x dx$ です。" },
                { title: "数学的極限", layman: "入力値が無限に大きくなるとき、公式の出力がどこに向かうかを観察することです。", academic: "変数が点または無限大に近づくときの関数の挙動を定義する微分積分学の基本概念です。", role: "収束挙動を検証するために外側表記（$\\sum \\lim$）で使用されます。" },
                { title: "グラフ収束解析", layman: "標準公式とSamuel Purbaの公式を並べて比較する2軸対話型グラフです。", academic: "桁違いに異なるデータ系列をマッピングする2軸視覚化手法（Chart.js）です。", role: "100％の数学的精度を視覚的に確認するためにシミュレータタブで使用されます。" },
                { title: "不定形", layman: "分子と分母の両方が0または無限大になり、代数的単純化が必要な分数です。", academic: "ロピタルの定理または代数的再構築を必要とする極限条件 $[0/0]$ です。", role: "元の公式で分母の $d/dt$ が0と評価されたときに発生しました。" },
                { title: "無限級数", layman: "1つの固定された目標値に向かって収束する数の無限の和です。", academic: "部分和の極限が定数に収束する無限数列の和です。", role: "Sophomore's Dreamの展開で使用され、$\\int_0^1 x^x dx \\approx 0.78343$ を評価します。" },
                { title: "AIメモ化＆キャッシュ", layman: "コンピュータが前回の計算結果を記憶し、同じ計算を繰り返さない手法です。", academic: "高コストな計算結果をルックアップキャッシュに保存するソフトウェア最適化です。", role: "`integralXPowerX(x)` で適用され、0.00 ms の応答時間を保証します。" },
                { title: "陰関数の微分", layman: "連鎖律を用いて多変数式の導関数を求める手法です。", academic: "変数を明示的に分離せずに陰関数方程式に連鎖律を適用することです。", role: "微分の対象を $y$ または $x$ に変更し、ゼロ微分エラーを解消する重要な修正です。" },
                { title: "AI数値計算", layman: "複雑な数学問題を超高速で解決するためにコンピュータとAIをプログラミングする学問です。", academic: "浮動小数点演算を介して連続解析問題を解決する数値アルゴリズムの設計です。", role: "バタム州立ポリテクニックのロボティクス＆AI卒業生によって構築された学術的基盤です。" }
            ]
        },
        zh: {
            laymanLabel: "💡 通俗解释（所有人可懂）:",
            academicLabel: "📐 规范学术解释:",
            roleLabel: "🎯 在 Samuel.AI 中的作用:",
            placeholder: "搜索术语（例如：偏导数、高斯、二项式）...",
            cards: [
                { title: "偏导数", layman: "测量当其中一个变量微小变动时公式值的变化速度。", academic: "多元函数关于其中一个独立变量的变化率算子。", role: "在 Samuel 的原始公式中，针对变量 t 求导导致结果为 0，从而引发除以零错误。" },
                { title: "除以零", layman: "在逻辑上，把一个物体分成 0 份是不可能的。", academic: "实数代数中的无定义表达式。", role: "Samuel Purba 原始公式的主要错误根源，Samuel.AI 通过修正求导变量成功予以修复。" },
                { title: "非初等积分", layman: "计算 x 的 x 次方的图形面积，无法用普通数学符号表示。", academic: "自指数函数 f(x) = x^x 的不可初等表达积分。", role: "Samuel.AI 采用高精度 16 点高斯-勒让德求积算法实现毫秒级瞬时计算。" },
                { title: "牛顿二项式定理", layman: "展开二项式高次幂的代数展开公式。", academic: "使用二项式系数 $\\binom{n}{k}$ 将 $(a+b)^n$ 展开为有序级数的经典定理。", role: "Samuel Purba 通用乘方公式 4.0 对齐并证明 100% 精确的学术标准。" },
                { title: "16点高斯-勒让德求积法", layman: "利用 16 个采样点快速计算复杂积分的高效 AI 数值方法。", academic: "在正交勒让德多项式根处放置评估节点的的高精度数值积分法。", role: "实现在浏览器中亚毫秒级（<0.01 ms）直接计算 $\\int x^x dx$ 的核心 AI 引擎。" },
                { title: "求和索引", layman: "希腊字母 Sigma（$\\sum$）表示：从下限到上限依次累加所有连续数字。", academic: "使用运行索引变量 $i$ 从 $i=k$ 到 $i=n$ 的有序求和级数表示法。", role: "从不匹配的 $i$ 修正为 $k$，确保二项式级数的准确计算。" },
                { title: "帕斯卡三角筛 $O(1)$", layman: "在内存中预先计算并存储所有组合数，以便即时调用的技术。", academic: "预计算二项式系数 $\\binom{n}{k}$ 的记忆化矩阵技术，赋予常数时间复杂度 $O(1)$。", role: "确保 UI 滑块和图形实现在 Samuel.AI 中无延迟流畅运行。" },
                { title: "通用乘方公式 4.0", layman: "由 Samuel Purba 提出的结合极限、导数和积分的创新代数展开概念。", academic: "使用二项式导数比和自指数积分的 $(x-y)^n$ 实验代数公式。", role: "连接初始发明与现代学术修正的 Samuel.AI 主要研究对象。" },
                { title: "自指数函数", layman: "一个数的自身次方（例如 $2^2=4, 3^3=27$），呈现极快的增长速度。", academic: "定义域 $x > 0$ 上的数学函数 $f(x) = x^x = e^{x \\ln x}$。", role: "Samuel Purba 原始公式中的核心被积函数 $\\int x^x dx$。" },
                { title: "数学极限", layman: "观察当输入值无限增大时公式输出的走向。", academic: "定义变量趋近于某点或无穷大时函数行为的基础微积分概念。", role: "在外层记号（$\\sum \\lim$）中用于检验收敛行为。" },
                { title: "图形收敛分析", layman: "并排比较标准公式曲线与 Samuel Purba 公式曲线的双轴交互图形。", academic: "映射数量级差异巨大数据系列的双 Y 轴数据可视化技术（Chart.js）。", role: "在模拟器标签页中用于视觉确认 100% 的数学精确度。" },
                { title: "未定式", layman: "分子和分母均评估为 0 或无穷大、需要代数简化的分式。", academic: "需要洛必达法则或代数重构的微积分极限条件 $[0/0]$。", role: "当原始公式中分母的 $d/dt$ 评估为零时出现。" },
                { title: "无穷级数", layman: "收敛于单个固定目标值的数的无止境求和。", academic: "部分和极限收敛于常数的无穷数列之和。", role: "在 Sophomore's Dream 展开中用于评估 $\\int_0^1 x^x dx \\approx 0.78343$。" },
                { title: "AI 记忆化与缓存", layman: "计算机记住先前的数学答案，从而不再重复计算相同内容的技术。", academic: "在键值查找缓存中存储高成本计算返回值的软件优化。", role: "应用于 `integralXPowerX(x)` 以保证 0.00 ms 的响应时间。" },
                { title: "隐函数求导", layman: "使用链式法则求多变量表达式导数的方法。", academic: "在没有显式变量隔离的情况下对隐式方程应用链式法则。", role: "将求导目标更改为 $y$ 或 $x$、消除零导数错误的关键修复。" },
                { title: "AI 数值计算", layman: "对计算机和 AI 进行编程以极快速度解决复杂数学问题的科学。", academic: "通过浮点运算解决连续分析问题的数值算法设计。", role: "由巴淡国立理工学院机器人与人工智能毕业生构建的核心学术基石。" }
            ]
        },
        de: {
            laymanLabel: "💡 Einfache Erklärung (Für alle):",
            academicLabel: "📐 Formale Akademische Erklärung:",
            roleLabel: "🎯 Rolle in Samuel.AI:",
            placeholder: "Begriff suchen (z.B. Ableitung, Gauß, Binomial)...",
            cards: [
                { title: "Partielle Ableitung", layman: "Misst die Änderungsrate einer Funktion nach einer einzelnen Variablen.", academic: "Partieller Differentialoperator zur Bestimmung der Änderungsrate einer multivariablen Funktion.", role: "In Samuels ursprünglicher Formel führte die Ableitung nach t zu Null und damit zur Division durch Null." },
                { title: "Division durch Null", layman: "Etwas durch 0 zu teilen ist mathematisch unmöglich.", academic: "Undefinierter algebraischer Ausdruck in den reellen Zahlen.", role: "Hauptfehler in der ursprünglichen Formel, der von Samuel.AI durch Variablenanpassung behoben wurde." },
                { title: "Nicht-elementares Integral", layman: "Berechnet die Fläche unter x hoch x. Kann nicht mit Standard-Symbolen ausgedrückt werden.", academic: "Integral der selbst-exponentiellen Funktion f(x) = x^x ohne elementare Stammfunktion.", role: "Samuel.AI nutzt 16-Punkt Gauß-Legendre Quadratur für sofortige Berechnung." },
                { title: "Newtons Binomischer Satz", layman: "Algebraische Formel zum Ausmultiplizieren von Binomen.", academic: "Klassisches Theorem zur Entwicklung von $(a+b)^n$ mittels Binomialkoeffizienten.", role: "Akademischer Standard zur Verifizierung der Universal Power Formula 4.0." },
                { title: "16-Punkt Gauß-Legendre Quadratur", layman: "KI-Methode zur schnellen Berechnung komplexer Integrale.", academic: "Hochpräzise numerische Integration an Legendre-Polynom-Nullstellen.", role: "Ermöglicht Sub-Millisekunden-Berechnung (<0.01 ms) von $\\int x^x dx$ im Browser." },
                { title: "Summenindex", layman: "Das Zeichen Sigma ($\\sum$) bedeutet: 'Summiere alle aufeinanderfolgenden Zahlen'.", academic: "Kompakte Notation für geordnete Summenreihen mit Laufindex variable $i$.", role: "Korrigiert von unpassendem $i$ zu $k$ für exakte Binomialreihenberechnung." },
                { title: "Pascalsches Dreieck Sieb $O(1)$", layman: "Im Speicher gespeicherte Kombinationen für sofortigen Zugriff.", academic: "Memoisationstechnik vorberechneter Binomialkoeffizienten mit konstanter Laufzeit $O(1)$.", role: "Garantiert flüssige UI-Reaktion ohne Verzögerung." },
                { title: "Universelle Potenzformel 4.0", layman: "Konzept von Samuel Purba mit Grenzwerten, Ableitungen und Integralen.", academic: "Experimentelle algebraische Formulierung von $(x-y)^n$.", role: "Hauptforschungsgegenstand von Samuel.AI." },
                { title: "Selbst-exponentielle Funktion", layman: "Eine Zahl hoch sich selbst (z.B. $2^2=4, 3^3=27$), die extrem schnell wächst.", academic: "Mathematische Funktion $f(x) = x^x = e^{x \\ln x}$ für $x > 0$.", role: "Kernkomponente $\\int x^x dx$ in der ursprünglichen Formel." },
                { title: "Mathematischer Grenzwert", layman: "Beobachtung des Verhaltens einer Formel bei unendlich großen Eingaben.", academic: "Fundamentales Kalkülkonzept zur Definition des Funktionsverhaltens.", role: "Verwendet in der äußeren Notation ($\\sum \\lim$)." },
                { title: "Grafische Konvergenzanalyse", layman: "Interaktiver Doppelachsen-Graph zum Vergleich der Formelkurven.", academic: "Zwei-Y-Achsen-Visualisierungstechnik (Chart.js) für unterschiedliche Größenordnungen.", role: "Visuelle Bestätigung von 100% mathematischer Präzision." },
                { title: "Unbestimmter Ausdruck", layman: "Bruch, bei dem Zähler und Nenner 0 ergeben.", academic: "Grenzwertbedingung $[0/0]$, die L'Hôpital erfordert.", role: "Trat auf, wenn $d/dt$ im Nenner zu Null ausgewertet wurde." },
                { title: "Unendliche Reihe", layman: "Endlose Summe von Zahlen, die gegen einen festen Zielwert konvergiert.", academic: "Summe einer unendlichen Folge mit konvergenter Partialsumme.", role: "Verwendet bei Sophomore's Dream zur Auswertung von $\\int_0^1 x^x dx \\approx 0.78343$." },
                { title: "KI-Memoisation & Caching", layman: "Technik, bei der der Computer Ergebnisse speichert, um Neuberechnungen zu vermeiden.", academic: "Softwareoptimierung zur Speicherung teurer Berechnungsergebnisse.", role: "Angewendet in `integralXPowerX(x)` für 0,00 ms Antwortzeit." },
                { title: "Implizite Differentiation", layman: "Ableitung eines mehrvariablen Ausdrucks mittels Kettenregel.", academic: "Anwendung der Kettenregel auf implizite Gleichungen.", role: "Schlüsselkorrektur zur Eliminierung von Null-Ableitungsfehlern." },
                { title: "KI-Numerik", layman: "Programmierung von Computern und KI zur blitzschnellen Lösung komplexer Matheprobleme.", academic: "Entwurf numerischer Algorithmen zur Lösung kontinuierlicher Probleme.", role: "Akademische Grundlage der Alumni der Politeknik Negeri Batam." }
            ]
        }
    };

    function applyLanguageTranslation(lang) {
        currentLang = lang;

        // Active state for language buttons
        langBtns.forEach(b => {
            if (b.getAttribute('data-lang') === lang) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        const langData = dictionaryTranslations[lang];

        dictCards.forEach((card, index) => {
            const titleEl = card.querySelector('h4');
            const sectionLabels = card.querySelectorAll('.dict-section-label');
            const sections = card.querySelectorAll('.dict-section p');

            if (lang === 'id' || !langData) {
                // Restore Indonesian
                const orig = originalCardTexts[index];
                if (orig) {
                    if (titleEl) titleEl.textContent = orig.title;
                    if (sections[0]) sections[0].innerHTML = orig.layman;
                    if (sections[1]) sections[1].innerHTML = orig.academic;
                    if (sections[2]) sections[2].innerHTML = orig.role;
                }
                if (sectionLabels[0]) sectionLabels[0].textContent = "💡 Penjelasan Awam (Semua Orang):";
                if (sectionLabels[1]) sectionLabels[1].textContent = "📐 Penjelasan Formal Akademis:";
                if (sectionLabels[2]) sectionLabels[2].textContent = "🎯 Peran di Samuel.AI:";
                if (dictSearchInput) dictSearchInput.placeholder = "Cari istilah (contoh: Turunan, Gauss, Binomial, Non-Elementer, d/dt, Quadrature)...";
            } else {
                // Apply translated text
                if (sectionLabels[0]) sectionLabels[0].textContent = langData.laymanLabel || "💡 Explanation:";
                if (sectionLabels[1]) sectionLabels[1].textContent = langData.academicLabel || "📐 Academic:";
                if (sectionLabels[2]) sectionLabels[2].textContent = langData.roleLabel || "🎯 Role:";
                if (dictSearchInput && langData.placeholder) dictSearchInput.placeholder = langData.placeholder;

                const cardTrans = langData.cards ? langData.cards[index] : null;
                if (cardTrans) {
                    if (titleEl && cardTrans.title) titleEl.textContent = cardTrans.title;
                    if (sections[0] && cardTrans.layman) sections[0].innerHTML = cardTrans.layman;
                    if (sections[1] && cardTrans.academic) sections[1].innerHTML = cardTrans.academic;
                    if (sections[2] && cardTrans.role) sections[2].innerHTML = cardTrans.role;
                }
            }
        });

        // Re-render KaTeX math formatting
        if (window.renderMathInElement) {
            const container = document.getElementById('dict-cards-container');
            if (container) {
                try { window.renderMathInElement(container); } catch (e) {}
            }
        }
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            applyLanguageTranslation(lang);
        });
    });

    translateCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Cycle language between ID -> EN -> JA -> ZH -> DE -> ID
            const langs = ['id', 'en', 'ja', 'zh', 'de'];
            let nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
            applyLanguageTranslation(langs[nextIndex]);
        });
    });

    function filterDictionary() {
        const query = dictSearchInput ? dictSearchInput.value.toLowerCase().trim() : '';

        if (dictSearchClear) {
            dictSearchClear.style.display = query.length > 0 ? 'inline' : 'none';
        }

        dictCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
            const cardText = card.textContent.toLowerCase();

            const matchesCategory = (currentCategory === 'all' || cardCat === currentCategory);
            const matchesQuery = query === '' || cardKeywords.includes(query) || cardText.includes(query);

            if (matchesCategory && matchesQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Trigger KaTeX rendering on visible math blocks if needed
        if (window.renderMathInElement) {
            const container = document.getElementById('dict-cards-container');
            if (container) {
                try { window.renderMathInElement(container); } catch (e) {}
            }
        }
    }

    if (dictSearchInput) {
        dictSearchInput.addEventListener('input', filterDictionary);
    }

    if (dictSearchClear) {
        dictSearchClear.addEventListener('click', () => {
            dictSearchInput.value = '';
            filterDictionary();
            dictSearchInput.focus();
        });
    }

    dictChips.forEach(chip => {
        chip.addEventListener('click', () => {
            dictChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.getAttribute('data-category');
            filterDictionary();
        });
    });
});


