/**
 * SAMUEL.A.I - 3-DOF Robotics Kinematics & Exponential Torque Damping Engine
 * Rumus Perpangkatan Universal 4.0
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 */

import { evaluateNewtonBinomial } from './math_engine.js';

export class SamuelRoboticsEngine {
    constructor(l1 = 150, l2 = 120, l3 = 80) {
        this.l1 = l1;
        this.l2 = l2;
        this.l3 = l3;
    }

    calculateFK(theta1, theta2, theta3) {
        const t1 = (theta1 * Math.PI) / 180;
        const t2 = (theta2 * Math.PI) / 180;
        const t3 = (theta3 * Math.PI) / 180;

        const r = this.l1 * Math.cos(t2) + this.l2 * Math.cos(t2 + t3) + this.l3 * Math.cos(t2 + t3);
        const x = r * Math.cos(t1);
        const y = r * Math.sin(t1);
        const z = this.l1 * Math.sin(t2) + this.l2 * Math.sin(t2 + t3) + this.l3 * Math.sin(t2 + t3);

        return {
            x: parseFloat(x.toFixed(3)),
            y: parseFloat(y.toFixed(3)),
            z: parseFloat(z.toFixed(3)),
            reach: parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(3))
        };
    }

    calculateIK(x, y, z) {
        const theta1 = (Math.atan2(y, x) * 180) / Math.PI;
        const rPlanar = Math.sqrt(x * x + y * y);
        const d = Math.sqrt(rPlanar * rPlanar + z * z);
        const maxReach = this.l1 + this.l2 + this.l3;
        const clampedD = Math.min(d, maxReach * 0.999);
        
        const cosElbow = (clampedD * clampedD - this.l1 * this.l1 - this.l2 * this.l2) / (2 * this.l1 * this.l2);
        const clampedCos = Math.max(-1, Math.min(1, cosElbow));
        const theta3 = (Math.acos(clampedCos) * 180) / Math.PI;
        
        const alpha = Math.atan2(z, rPlanar);
        const beta = Math.atan2(this.l2 * Math.sin((theta3 * Math.PI) / 180), this.l1 + this.l2 * Math.cos((theta3 * Math.PI) / 180));
        const theta2 = ((alpha - beta) * 180) / Math.PI;

        return {
            theta1: parseFloat(theta1.toFixed(2)),
            theta2: parseFloat(theta2.toFixed(2)),
            theta3: parseFloat(theta3.toFixed(2)),
            reachable: d <= maxReach
        };
    }

    computeExponentialTorque(thetaError, targetVelocity, n = 2, lambda = 50.0) {
        const deltaTheta = Math.abs(thetaError);
        const expDivergence = evaluateNewtonBinomial(deltaTheta, 0.05 * deltaTheta, n);
        const dampingFactor = Math.exp(-expDivergence / lambda);
        const torque = 12.5 * thetaError + 0.8 * targetVelocity * dampingFactor;
        return {
            dampingTorque: parseFloat(torque.toFixed(4)),
            divergence: parseFloat(expDivergence.toFixed(4)),
            dampingFactor: parseFloat(dampingFactor.toFixed(4))
        };
    }
}
