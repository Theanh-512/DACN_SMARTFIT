import { Injectable } from '@angular/core';

export interface SliderInputs {
  height_cm: number;
  weight_kg?: number;
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  shoulder_cm: number;
  gender?: 'male' | 'female' | 'neutral';
}

export interface BodyShapeResult {
  betas: number[];
  regionalMorphs: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class SliderRegressionService {
  readonly baselines: Record<string, { height_cm: number; weight_kg: number; chest_cm: number; waist_cm: number; hip_cm: number; shoulder_cm: number }> = {
    male: { height_cm: 179.1, weight_kg: 75.0, chest_cm: 97.0, waist_cm: 94.0, hip_cm: 103.0, shoulder_cm: 52.0 },
    female: { height_cm: 165.8, weight_kg: 56.0, chest_cm: 89.0, waist_cm: 82.8, hip_cm: 104.5, shoulder_cm: 48.0 },
    neutral: { height_cm: 171.7, weight_kg: 65.0, chest_cm: 92.0, waist_cm: 87.5, hip_cm: 103.5, shoulder_cm: 49.8 }
  };

  /**
   * Integrated Body Shape & Regional Morph Synthesis Engine:
   * Maps friendly anthropometric slider inputs into:
   * 1. 10 SMPL shape betas (with exact height compensation to keep stature constant during fullness changes)
   * 2. 6 Regional Morph Target influences (lateral shoulder breadth, chest volume, abdomen projection, limbs)
   */
  predictShape(inputs: SliderInputs): BodyShapeResult {
    const g = inputs.gender && this.baselines[inputs.gender] ? inputs.gender : 'female';
    const m0 = this.baselines[g];

    // 1. Height delta & Stature beta
    const deltaH = inputs.height_cm - m0.height_cm;
    let betaHeight = 0.0;
    if (g === 'female') {
      betaHeight = deltaH / 7.10;
    } else if (g === 'male') {
      betaHeight = -deltaH / 7.70;
    } else {
      betaHeight = deltaH / 7.40;
    }

    // 2. Fullness / Body Build (Weight) with Height Compensation
    const weightVal = inputs.weight_kg ?? m0.weight_kg;
    const deltaW = weightVal - m0.weight_kg;
    // Normalized fullness factor F in [-1.5, 1.8]
    const F = Math.max(-1.5, Math.min(1.8, deltaW / 18.0));

    // In SMPL, beta_1 controls slimness (+) vs fullness (-).
    // Height changes with beta_1 are compensated on beta_0 so body height remains pinned to height_cm!
    let beta0 = 0.0;
    let beta1 = -F;
    if (g === 'female') {
      beta0 = betaHeight + 0.155 * F;
    } else if (g === 'male') {
      beta0 = betaHeight - 0.117 * F;
    } else {
      beta0 = betaHeight + 0.130 * F;
    }

    const betas = new Array(10).fill(0.0);
    betas[0] = Math.max(-3.0, Math.min(3.0, Number(beta0.toFixed(4))));
    betas[1] = Math.max(-3.0, Math.min(3.0, Number(beta1.toFixed(4))));

    // 3. Shoulder Breadth (Biacromial breadth)
    // Lateral shoulder morph provides 7.0 cm total breadth adjustment at +/-1.0
    const deltaShoulder = inputs.shoulder_cm - m0.shoulder_cm;
    const morphShoulders = Math.max(-1.0, Math.min(1.2, Number((deltaShoulder / 4.0).toFixed(4))));

    // 4. Chest Volume & Circumference
    // Residual chest beyond global fullness
    const deltaChest = inputs.chest_cm - m0.chest_cm;
    const residualChest = deltaChest - (F * 11.0);
    const morphChest = Math.max(-0.8, Math.min(1.5, Number((residualChest / 8.0).toFixed(4))));

    // 5. Abdomen / Waist Projection & Circumference
    // Residual waist beyond global fullness
    const deltaWaist = inputs.waist_cm - m0.waist_cm;
    const residualWaist = deltaWaist - (F * 10.0);
    const morphAbdomen = Math.max(-0.8, Math.min(1.5, Number((residualWaist / 8.0).toFixed(4))));

    // 6. Limb & Gluteal Fullness
    const deltaHip = inputs.hip_cm - m0.hip_cm;
    const residualHip = deltaHip - (F * 10.0);
    const morphThighs = Math.max(-0.6, Math.min(1.2, Number(((0.35 * F) + (residualHip / 16.0)).toFixed(4))));
    const morphBiceps = Math.max(-0.6, Math.min(1.2, Number((0.30 * F).toFixed(4))));
    const morphButtocks = Math.max(-0.6, Math.min(1.2, Number(((0.35 * F) + (residualHip / 16.0)).toFixed(4))));

    const regionalMorphs: Record<string, number> = {
      morph_abdomen: morphAbdomen,
      morph_chest: morphChest,
      morph_biceps: morphBiceps,
      morph_thighs: morphThighs,
      morph_buttocks: morphButtocks,
      morph_shoulders: morphShoulders
    };

    return {
      betas,
      regionalMorphs
    };
  }

  /**
   * Backwards compatible prediction returning 10 SMPL betas.
   */
  predictBetas(inputs: SliderInputs): number[] {
    return this.predictShape(inputs).betas;
  }
}
