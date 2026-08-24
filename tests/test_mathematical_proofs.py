import unittest
import math
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine.proof_verification import SamuelProofEngine
from engine.arbitrary_precision import ArbitraryPrecisionEngine
from engine.quadrature_engine import QuadratureEngine

class TestSamuelMathematicalEngine(unittest.TestCase):
    def setUp(self):
        self.engine = SamuelProofEngine()
        self.arb_engine = ArbitraryPrecisionEngine(precision=60)
        self.quad_engine = QuadratureEngine()

    def test_theorem_1_singularity_elimination(self):
        t1 = self.engine.verify_theorem_1_singularity_elimination()
        self.assertEqual(t1['status'], 'VERIFIED_EXACT')
        self.assertEqual(t1['dS_dt'], 0)
        self.assertTrue(t1['singularity_resolved'])

    def test_theorem_2_sophomore_dream(self):
        t2 = self.engine.verify_theorem_2_sophomore_dream(terms=60)
        self.assertEqual(t2['status'], 'VERIFIED_EXACT')
        self.assertLess(t2['absolute_error'], 1e-15)

    def test_theorem_3_binomial_equivalence_multi_case(self):
        cases = [
            (5, 2, 3),
            (10, 4, 4),
            (7, 3, 5),
            (12, 5, 10),
            (100, 99, 0),
            (2.5, 1.2, 4)
        ]
        for x, y, n in cases:
            t3 = self.engine.verify_theorem_3_newton_equivalence(x, y, n)
            self.assertEqual(t3['status'], 'VERIFIED_EXACT')
            self.assertLess(t3['absolute_error'], 1e-9)

    def test_theorem_4_partial_derivative(self):
        t4 = self.engine.verify_theorem_4_partial_derivative(7, 2, 3)
        self.assertEqual(t4['status'], 'VERIFIED_EXACT')
        self.assertAlmostEqual(t4['computed_derivative'], -75.0, places=7)

    def test_theorem_5_limit_invariance(self):
        t5 = self.engine.verify_theorem_5_limit_invariance(5, 2, 3)
        self.assertEqual(t5['status'], 'VERIFIED_EXACT')
        self.assertAlmostEqual(t5['limit_ratio'], 1.0, places=7)

    def test_arbitrary_precision_evaluation(self):
        res = self.arb_engine.evaluate_arbitrary_precision("7.0", "2.0", 3)
        self.assertEqual(int(res), 125)

    def test_quadrature_comparison(self):
        bench = self.quad_engine.benchmark_comparison(1.0)
        self.assertLess(bench['gl_error'], 1e-7)
        self.assertLess(bench['ts_error'], 1e-5)

if __name__ == '__main__':
    unittest.main()
