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

        // Trigger chart update if switching to calculator tab
        if (tabId === 'calculator') {
            setTimeout(updateCalculator, 50);
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

    // Helper functions for math
    function binomial(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - k + i) / i;
        }
        return Math.round(res);
    }

    // Numerical integration of t^t from 0.0001 to x
    function integralXPowerX(x) {
        if (x <= 0) return 0;
        const steps = 1000;
        const start = 0.0001;
        const h = (x - start) / steps;
        let sum = 0.5 * (Math.pow(start, start) + Math.pow(x, x));
        for (let i = 1; i < steps; i++) {
            const t = start + i * h;
            sum += Math.pow(t, t);
        }
        return sum * h;
    }

    // Calculate sum for coefficient
    function getSumCoef(n, k) {
        let sum = 0;
        for (let i = k; i <= n; i++) {
            sum += binomial(n, i);
        }
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
            const corrRes = evaluateSamuelFormula(x, y, n, 1, 'y');
            if (corrRes.error) {
                quickResCorr.textContent = "❌ " + corrRes.error;
            } else {
                quickResCorr.textContent = corrRes.value.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            }
        }
    }

    [quickX, quickY, quickN].forEach(input => {
        input.addEventListener('input', updateQuickCalc);
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

    let convergenceChart = null;

    function evaluateSamuelFormula(x, y, n, k, derivVar) {
        const intVal = integralXPowerX(x);
        const sumCoef = getSumCoef(n, k);

        if (derivVar === 't') {
            return { value: NaN, error: 'Division by Zero: d/dt(f(x,y)) = 0' };
        } else if (derivVar === 'x') {
            // d/dx of sum_{i=k}^n binomial(n, i) x^{k-n} y^k
            // = (k - n) * x^{k-n-1} * y^k * sumCoef
            const derivNum = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;
            const derivDenom = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;

            if (derivDenom === 0) {
                return { value: NaN, error: 'Division by Zero: turunan penyebut = 0' };
            }

            const samuelVal = (intVal * derivNum - intVal) / derivDenom;
            return { value: samuelVal, error: null };
        } else if (derivVar === 'y') {
            // d/dy of sum_{i=k}^n binomial(n, i) x^{k-n} y^k
            // = k * y^{k-1} * x^{k-n} * sumCoef
            const derivNum = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;
            const derivDenom = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;

            if (derivDenom === 0) {
                return { value: NaN, error: 'Division by Zero: turunan penyebut = 0' };
            }

            const samuelVal = (intVal * derivNum - intVal) / derivDenom;
            return { value: samuelVal, error: null };
        }
        return { value: NaN, error: 'Unknown derivative variable' };
    }

    function updateCalculator() {
        const x = parseFloat(calcX.value) || 0;
        const y = parseFloat(calcY.value) || 0;
        const n = parseInt(calcN.value) || 1;
        const k = parseInt(calcK.value) || 0;
        const derivVar = calcDeriv.value;

        // Evaluate standard
        const stdVal = Math.pow(x - y, n);
        resStdVal.textContent = stdVal.toLocaleString('id-ID', { maximumFractionDigits: 4 });

        // Evaluate Samuel
        const samResult = evaluateSamuelFormula(x, y, n, k, derivVar);
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
        if (derivVar === 't') {
            simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dt}$ (Turunan terhadap $t$ = 0)';
        } else if (derivVar === 'x') {
            simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dx}$ (Penyebut tidak mengandung $x$ = 0)';
        } else {
            simFormulaRef.innerHTML = 'Menggunakan $\\frac{d}{dy}$ & Integrasi Numerik $\\int x^x$';
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

        if (stepIntEl) stepIntEl.textContent = intVal.toLocaleString('id-ID', { maximumFractionDigits: 6 });
        if (stepCoefEl) stepCoefEl.textContent = sumCoef.toLocaleString('id-ID');

        let stepDerivText = '';
        let stepFinalText = '';

        if (derivVar === 't') {
            stepDerivText = 'Turunan pembilang (d/dt) = 0 | Turunan penyebut (d/dt) = 0';
            stepFinalText = '❌ Pembagian dengan Nol (Turunan penyebut = 0)';
        } else if (derivVar === 'x') {
            const dNum = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;
            const dDenom = (k - n) * Math.pow(x, k - n - 1) * Math.pow(y, k) * sumCoef;
            stepDerivText = `Pembilang (d/dx) = ${dNum.toLocaleString('id-ID', { maximumFractionDigits: 4 })} | Penyebut (d/dx) = ${dDenom.toLocaleString('id-ID', { maximumFractionDigits: 4 })}`;
            if (dDenom === 0) {
                stepFinalText = '❌ Pembagian dengan Nol (k = n, x = 0, atau y = 0)';
            } else {
                const finalVal = (intVal * dNum - intVal) / dDenom;
                stepFinalText = finalVal.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            }
        } else if (derivVar === 'y') {
            const dNum = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;
            const dDenom = k * Math.pow(y, k - 1) * Math.pow(x, k - n) * sumCoef;
            stepDerivText = `Pembilang (d/dy) = ${dNum.toLocaleString('id-ID', { maximumFractionDigits: 4 })} | Penyebut (d/dy) = ${dDenom.toLocaleString('id-ID', { maximumFractionDigits: 4 })}`;
            if (dDenom === 0) {
                stepFinalText = '❌ Pembagian dengan Nol (k = 0, x = 0, atau y = 0)';
            } else {
                const finalVal = (intVal * dNum - intVal) / dDenom;
                stepFinalText = finalVal.toLocaleString('id-ID', { maximumFractionDigits: 4 });
            }
        }
        if (stepDerivEl) stepDerivEl.textContent = stepDerivText;
        if (stepFinalEl) stepFinalEl.textContent = stepFinalText;
 
        // Update Chart
        updateChart(y, n, k, derivVar);
    }

    function updateChart(y, n, k, derivVar) {
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
            const samRes = evaluateSamuelFormula(currentX, y, n, k, derivVar);
            samDataset.push(samRes.error ? null : samRes.value);
        }

        const ctx = document.getElementById('convergenceChart').getContext('2d');

        if (convergenceChart) {
            convergenceChart.destroy();
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
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        pointRadius: 3,
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: derivVar === 'y' ? `Samuel Formula (Terintegrasi)` : `Samuel Formula (Error: Div by 0)`,
                        data: samDataset,
                        borderColor: derivVar === 'y' ? '#6366f1' : '#ef4444',
                        backgroundColor: derivVar === 'y' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        borderDash: derivVar === 'y' ? [] : [5, 5],
                        pointRadius: derivVar === 'y' ? 3 : 0,
                        fill: false,
                        tension: 0.2
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
                            text: 'Hasil Perhitungan',
                            color: '#e5e7eb'
                        }
                    }
                }
            }
        });
    }

    [calcX, calcY, calcN, calcK, calcDeriv].forEach(input => {
        input.addEventListener('input', updateCalculator);
    });


    // Formula Fixer / Corrector Logic
    const fixDeriv = document.getElementById('fix-deriv');
    const fixIndex = document.getElementById('fix-index');
    const fixIntegral = document.getElementById('fix-integral');
    const correctedMathRender = document.getElementById('corrected-math-render');
    const correctedExplanation = document.getElementById('corrected-explanation');

    function updateFormulaFixer() {
        const dDeriv = fixDeriv.checked;
        const dIndex = fixIndex.checked;
        const dInt = fixIntegral.checked;

        let latex = '';
        let explanation = '';

        if (dDeriv && dIndex && dInt) {
            latex = '(x - y)^n = \\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-1)^k y^k';
            explanation = '<strong>Rekomendasi Utama:</strong> Formula disederhanakan sepenuhnya menjadi <em>Teorema Binomial Newton</em> yang baku. Semua masalah kritis (pembagian dengan nol, integral non-elementer $\\int x^x$, dan indeks sumasi) berhasil diatasi. Formula ini sangat stabil dan dapat dihitung langsung dalam hitungan milidetik.';
        } else if (dDeriv && dIndex && !dInt) {
            latex = '(x - y)^n = \\lim_{x \\to \\infty} \\left( \\frac{\\int x^x \\, dx \\cdot \\frac{d}{dy}\\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-y)^k - \\int x^x \\, dx}{\\frac{d}{dy}\\sum_{k=0}^n \\binom{n}{k} x^{n-k} (-y)^k} \\right)';
            explanation = '<strong>Perbaikan Parsial:</strong> Turunan diubah ke $y$ dan indeks sumasi diselaraskan ($i \\to k$). Dengan modifikasi ini, rumus tidak lagi menghasilkan pembagian dengan nol dan secara teoretis bernilai berhingga, tetapi kehadiran integral non-elementer $\\int x^x$ masih mempersulit komputasi langsung.';
        } else if (dDeriv && !dIndex && !dInt) {
            latex = '(x - y)^n = \\frac{\\int x^x \\, dx \\cdot \\frac{d}{dy} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k - \\int x^x \\, dx}{\\frac{d}{dy} \\sum_{i=k}^n \\binom{n}{i} x^{k-n} y^k}';
            explanation = '<strong>Perbaikan Minimum:</strong> Hanya mengubah variabel turunan menjadi terhadap $y$ (menghindari pembagian dengan nol). Namun suku-suku sumasi masih tidak selaras karena indeks sumasi berjalan $i$ tidak digunakan secara tepat pada suku eksponensial di dalamnya.';
        } else if (!dDeriv && dIndex && dInt) {
            latex = '\\text{Error: Pembagian dengan Nol tetap terjadi karena } \\frac{d}{dt}(\\dots) = 0';
            explanation = '<strong>Masalah Kritis:</strong> Meskipun indeks sumasi diselaraskan dan integral dihilangkan, pembagian dengan nol tetap terjadi karena Anda mempertahankan turunan terhadap $t$ (yang bernilai $0$ karena tidak ada variabel $t$).';
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

    [fixDeriv, fixIndex, fixIntegral].forEach(checkbox => {
        checkbox.addEventListener('change', updateFormulaFixer);
    });

    // Initialize Fixer
    updateFormulaFixer();
});
