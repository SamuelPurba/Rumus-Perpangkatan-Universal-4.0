/**
 * SAMUEL.A.I - Multi-Language Technical Translation Engine (5 Languages)
 * Rumus Perpangkatan Universal 4.0
 * Author: Samuel Hasiholan Omega Purba, S. Tr. T.
 */

export const DICTIONARY = {
    id: {
        appTitle: "Samuel.A.I - Rumus Perpangkatan Universal 4.0",
        authorRole: "Alumni Teknik Robotika & AI, Politeknik Negeri Batam | Founder: BeruangLaut.ID",
        tabMath: "Audit Matematika",
        tabEngine: "Kalkulator Presisi",
        tabRobotics: "Kinematika Robotika 3-DOF",
        tabIoT: "Edge IoT & Smart Meter",
        tabPaper: "Naskah Ilmiah IEEE",
        verifyButton: "Jalankan Verifikasi Teorema",
        singularityTitle: "Eliminasi Singularitas Pembagian Nol",
        quadratureTitle: "16-Point Gauss-Legendre Quadrature",
        errorGuaranteed: "Garansi Kesalahan 0% Terverifikasi"
    },
    en: {
        appTitle: "Samuel.A.I - Universal Exponentiation Formula 4.0",
        authorRole: "Robotics & AI Engineering Alumni, Politeknik Negeri Batam | Founder: BeruangLaut.ID",
        tabMath: "Mathematical Audit",
        tabEngine: "Precision Calculator",
        tabRobotics: "3-DOF Robotics Kinematics",
        tabIoT: "Edge IoT & Smart Meter",
        tabPaper: "IEEE Manuscript",
        verifyButton: "Execute Theorem Verification",
        singularityTitle: "Division-by-Zero Singularity Elimination",
        quadratureTitle: "16-Point Gauss-Legendre Quadrature",
        errorGuaranteed: "0% Error Guaranteed & Verified"
    },
    ja: {
        appTitle: "Samuel.A.I - 万能累乗公式 4.0",
        authorRole: "ロボティクス・人工知能工学、バタム州立理工大学",
        tabMath: "数学的監査",
        tabEngine: "高精度計算エンジン",
        tabRobotics: "3自由度ロボット運動学",
        tabIoT: "エッジIoTテレメトリ",
        tabPaper: "IEEE学術論文",
        verifyButton: "定理検証を実行",
        singularityTitle: "ゼロ除算特異点の解消",
        quadratureTitle: "16点ガウス・ルジャンドル求積法",
        errorGuaranteed: "0%誤差保証検証済み"
    },
    zh: {
        appTitle: "Samuel.A.I - 通用幂运算公式 4.0",
        authorRole: "机器人与人工智能工程系，巴淡国立理工学院",
        tabMath: "数学审计",
        tabEngine: "高精度计算引擎",
        tabRobotics: "三自由度机器人运动学",
        tabIoT: "边缘物联网遥测",
        tabPaper: "IEEE学术论文",
        verifyButton: "运行定理验证",
        singularityTitle: "消除除以零奇异性",
        quadratureTitle: "16点高斯-勒让德求积法",
        errorGuaranteed: "0%误差保证已验证"
    },
    de: {
        appTitle: "Samuel.A.I - Universelle Potenzierungsformel 4.0",
        authorRole: "Robotik & KI-Ingenieurwesen, Politeknik Negeri Batam",
        tabMath: "Mathematisches Audit",
        tabEngine: "Präzisionsrechner",
        tabRobotics: "3-DOF Robotik-Kinematik",
        tabIoT: "Edge-IoT-Telemetrie",
        tabPaper: "IEEE-Manuskript",
        verifyButton: "Theorem-Verifikation ausführen",
        singularityTitle: "Beseitigung der Division durch Null",
        quadratureTitle: "16-Punkt-Gauß-Legendre-Quadratur",
        errorGuaranteed: "0% Fehler garantiert & verifiziert"
    }
};

export function setLanguage(lang = "id") {
    const dict = DICTIONARY[lang] || DICTIONARY.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
}
