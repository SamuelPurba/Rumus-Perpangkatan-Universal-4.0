"""
Arbitrary-Precision & Complex Exponent Engine
Rumus Perpangkatan Universal 4.0
Author: Samuel Hasiholan Omega Purba, S. Tr. T.
"""

import cmath
import math
from decimal import Decimal, getcontext
from typing import Union, List, Tuple

class ArbitraryPrecisionEngine:
    """
    Arbitrary-precision arithmetic and generalized complex exponent expansion.
    """
    
    def __init__(self, precision: int = 100):
        self.precision = precision
        getcontext().prec = precision

    def binomial_coefficient(self, n: int, k: int) -> int:
        """Exact integer binomial coefficient C(n, k)"""
        if k < 0 or k > n:
            return 0
        return math.comb(n, k)

    def evaluate_arbitrary_precision(self, x_str: str, y_str: str, n: int) -> Decimal:
        """
        Evaluate (x - y)^n with high decimal precision using Newton's binomial theorem.
        """
        getcontext().prec = self.precision
        x = Decimal(x_str)
        y = Decimal(y_str)
        
        total = Decimal(0)
        for k in range(n + 1):
            coef = Decimal(self.binomial_coefficient(n, k))
            term = coef * (x ** (n - k)) * (Decimal(-1) ** k) * (y ** k)
            total += term
        return total

    @staticmethod
    def generalized_falling_factorial(alpha: complex, k: int) -> complex:
        """Falling factorial (alpha)_k = alpha * (alpha - 1) * ... * (alpha - k + 1)"""
        res = 1.0 + 0.0j
        for i in range(k):
            res *= (alpha - i)
        return res

    def evaluate_complex_exponent(self, x: complex, y: complex, alpha: complex, max_terms: int = 100) -> complex:
        """
        Generalized Binomial Theorem for Complex / Fractional Exponents (x - y)^alpha
        Valid when |y/x| < 1.
        (x - y)^alpha = x^alpha * sum_{k=0}^infty [(-1)^k * (alpha)_k / k!] * (y/x)^k
        """
        if abs(x) == 0:
            raise ValueError("Base x cannot be zero in complex expansion.")
        
        ratio = y / x
        if abs(ratio) >= 1.0 and abs(ratio) != 0:
            # Direct complex power fallback if outside unit disc
            return (x - y) ** alpha
            
        x_pow_alpha = x ** alpha
        series_sum = 0.0 + 0.0j
        k_fact = 1.0
        
        for k in range(max_terms):
            if k > 0:
                k_fact *= k
            falling = self.generalized_falling_factorial(alpha, k)
            coef = ((-1.0) ** k) * falling / k_fact
            term = coef * (ratio ** k)
            series_sum += term
            if abs(term) < 1e-16:
                break
                
        return x_pow_alpha * series_sum

    def compare_complex_evaluation(self, x: complex, y: complex, alpha: complex) -> dict:
        """Compare series expansion with direct complex exponentiation"""
        direct = (x - y) ** alpha
        series = self.evaluate_complex_exponent(x, y, alpha)
        error = abs(direct - series)
        return {
            "x": str(x),
            "y": str(y),
            "alpha": str(alpha),
            "direct_value": str(direct),
            "series_value": str(series),
            "absolute_error": error,
            "relative_error": error / abs(direct) if abs(direct) > 0 else error,
            "status": "CONVERGED" if error < 1e-7 else "APPROXIMATE"
        }
