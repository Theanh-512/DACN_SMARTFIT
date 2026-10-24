import { Injectable } from '@angular/core';

export interface SliderInputs {
  height_cm: number;
  weight_kg?: number;
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  shoulder_cm: number;
  arm_length_cm?: number;
  gender?: 'male' | 'female' | 'neutral';
}

@Injectable({
  providedIn: 'root'
})
export class SliderRegressionService {
  private readonly baselines: Record<string, { height_cm: number; chest_cm: number; waist_cm: number; hip_cm: number; shoulder_cm: number }> = {
    male: { height_cm: 179.1, chest_cm: 97.0, waist_cm: 93.5, hip_cm: 103.0, shoulder_cm: 51.9 },
    female: { height_cm: 165.8, chest_cm: 89.0, waist_cm: 82.6, hip_cm: 104.3, shoulder_cm: 47.9 },
    neutral: { height_cm: 171.7, chest_cm: 91.5, waist_cm: 87.5, hip_cm: 103.5, shoulder_cm: 49.8 }
  };

  // 10 x 5 Calibrated Pseudoinverse matrices: beta_j = sum(W_jk * (meas_k - baseline_k))
  // Feature order: [height_cm, chest_cm, waist_cm, hip_cm, shoulder_cm]
  private readonly pinvWeights: Record<string, number[][]> = {
    male: [
      [-0.11724, -0.00919, -0.00218, -0.00065, -0.00847],
      [ 0.11456, -0.11126,  0.01523, -0.01455, -0.18121],
      [ 0.02334, -0.02858,  0.01891,  0.03119, -0.05412],
      [ 0.13670,  0.34435, -0.31460,  0.00157, -0.27022],
      [ 0.38289, -0.24394,  0.24940,  0.01661, -1.43453],
      [ 0.07643, -0.01608, -0.03178,  0.14984, -0.37980],
      [ 0.08500,  0.04704,  0.06531, -0.20637, -0.13824],
      [-0.11383,  0.04196, -0.05025,  0.02518,  0.38572],
      [ 0.02428, -0.12560,  0.08915,  0.06603, -0.20264],
      [ 0.31345,  0.12802, -0.03242, -0.15053, -0.86123]
    ],
    female: [
      [ 0.16174, -0.03130,  0.05674, -0.00921, -0.21254],
      [ 0.02514, -0.00486, -0.07579, -0.01289,  0.18401],
      [-0.13141,  0.16030, -0.23572,  0.07611,  0.91971],
      [-0.14586, -0.14226,  0.17752, -0.00054,  0.25076],
      [ 0.14854,  0.01134,  0.02264, -0.06874, -0.46350],
      [-0.11629,  0.04793, -0.12877,  0.13082,  0.44285],
      [-0.17330,  0.05368,  0.00164, -0.13119,  0.96569],
      [ 0.12630,  0.07009, -0.09897,  0.03834, -0.36975],
      [-0.28539,  0.06264, -0.10904,  0.04132,  1.27306],
      [-0.36029,  0.12339, -0.20269,  0.06849,  1.69845]
    ],
    neutral: [
      [-0.00744,  0.00640,  0.00935, -0.02229,  0.35022],
      [ 0.16638, -0.05280, -0.03237,  0.00332, -0.37742],
      [ 0.47320, -0.02410, -0.00928,  0.12191, -1.63836],
      [-0.11168,  0.18465, -0.14925, -0.12249,  0.55658],
      [-0.14593,  0.17286, -0.20983,  0.04788,  0.69178],
      [-0.15784, -0.11375,  0.14839, -0.06376,  0.42182],
      [ 0.12762, -0.15301,  0.18419, -0.00957, -0.64019],
      [ 0.32948,  0.07322, -0.03766, -0.04562, -1.11598],
      [ 0.34060, -0.09186,  0.08214,  0.05020, -1.27339],
      [ 0.05926,  0.03568, -0.04731,  0.01703, -0.16022]
    ]
  };

  /**
   * Dự đoán 10 giá trị betas từ số đo giải phẫu nhân trắc học cho từng giới tính.
   */
  predictBetas(inputs: SliderInputs): number[] {
    const g = inputs.gender && this.baselines[inputs.gender] ? inputs.gender : 'male';
    const m0 = this.baselines[g];
    const W = this.pinvWeights[g];

    // Delta số đo giải phẫu: [height, chest, waist, hip, shoulder]
    const delta = [
      inputs.height_cm - m0.height_cm,
      inputs.chest_cm - m0.chest_cm,
      inputs.waist_cm - m0.waist_cm,
      inputs.hip_cm - m0.hip_cm,
      inputs.shoulder_cm - m0.shoulder_cm
    ];

    const betas = new Array(10).fill(0);
    for (let j = 0; j < 10; j++) {
      let sum = 0.0;
      const row = W[j];
      for (let k = 0; k < 5; k++) {
        sum += row[k] * delta[k];
      }
      // Giới hạn trong biên an toàn [-3.0, 3.0] của không gian PCA SMPL
      betas[j] = Math.max(-3.0, Math.min(3.0, Number(sum.toFixed(4))));
    }

    return betas;
  }
}

