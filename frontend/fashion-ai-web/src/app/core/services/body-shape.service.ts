import { Injectable } from '@angular/core';

export interface RegionalMorphValues {
  [key: string]: number;
  morph_abdomen: number;   // 0.0 to 1.0
  morph_chest: number;     // 0.0 to 1.0
  morph_biceps: number;    // 0.0 to 1.0
  morph_thighs: number;    // 0.0 to 1.0
  morph_buttocks: number;  // 0.0 to 1.0
  morph_shoulders: number; // 0.0 to 1.0
}

export interface BodyShapePreset {
  id: string;
  nameVi: string;
  description: string;
  genderTarget?: 'all' | 'female' | 'male';
  betas: number[];
  regionalMorphs: RegionalMorphValues;
  measurements: {
    height_cm: number;
    weight_kg: number;
    chest_cm: number;
    waist_cm: number;
    hip_cm: number;
    shoulder_cm: number;
    arm_length_cm?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BodyShapeService {
  readonly regionalControls = [
    { id: 'morph_abdomen', nameVi: 'Độ nhô bụng (Abdomen)', min: 0.0, max: 1.0, step: 0.05 },
    { id: 'morph_chest', nameVi: 'Vòng ngực / Cơ ngực (Chest)', min: 0.0, max: 1.0, step: 0.05 },
    { id: 'morph_biceps', nameVi: 'Bắp tay (Upper Arm/Biceps)', min: 0.0, max: 1.0, step: 0.05 },
    { id: 'morph_thighs', nameVi: 'Đùi (Thighs)', min: 0.0, max: 1.0, step: 0.05 },
    { id: 'morph_buttocks', nameVi: 'Vòng mông (Buttocks)', min: 0.0, max: 1.0, step: 0.05 },
    { id: 'morph_shoulders', nameVi: 'Khung vai (Shoulders)', min: 0.0, max: 1.0, step: 0.05 }
  ];

  readonly shapePresets: BodyShapePreset[] = [
    {
      id: 'balanced',
      nameVi: 'Cân đối (Balanced)',
      description: 'Dáng người chuẩn theo tỷ lệ nhân trắc học tự nhiên',
      betas: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.0,
        morph_chest: 0.0,
        morph_biceps: 0.0,
        morph_thighs: 0.0,
        morph_buttocks: 0.0,
        morph_shoulders: 0.0
      },
      measurements: {
        height_cm: 172.0,
        weight_kg: 68.0,
        chest_cm: 92.0,
        waist_cm: 80.0,
        hip_cm: 95.0,
        shoulder_cm: 45.0,
        arm_length_cm: 55.0
      }
    },
    {
      id: 'slim',
      nameVi: 'Gầy / Mảnh mai (Slim)',
      description: 'Chỉ số BMI thấp, chân tay thon dài, mỡ thừa tối thiểu',
      betas: [-1.8, 0.6, -0.8, -1.2, -1.0, -0.4, -0.6, 0.2, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.0,
        morph_chest: 0.0,
        morph_biceps: 0.0,
        morph_thighs: 0.0,
        morph_buttocks: 0.0,
        morph_shoulders: 0.0
      },
      measurements: {
        height_cm: 174.0,
        weight_kg: 56.0,
        chest_cm: 84.0,
        waist_cm: 71.0,
        hip_cm: 87.0,
        shoulder_cm: 42.0,
        arm_length_cm: 56.0
      }
    },
    {
      id: 'athletic',
      nameVi: 'Thể thao / Cơ bắp (Athletic)',
      description: 'Vai rộng chữ V, ngực nở, cơ bắp tay và đùi phát triển, eo thắt',
      betas: [0.4, 0.3, 1.2, -0.4, 0.2, 1.4, 1.0, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.0,
        morph_chest: 0.85,
        morph_biceps: 0.90,
        morph_thighs: 0.70,
        morph_buttocks: 0.40,
        morph_shoulders: 0.80
      },
      measurements: {
        height_cm: 176.0,
        weight_kg: 74.0,
        chest_cm: 104.0,
        waist_cm: 78.0,
        hip_cm: 96.0,
        shoulder_cm: 49.0,
        arm_length_cm: 56.0
      }
    },
    {
      id: 'fuller',
      nameVi: 'Đầy đặn (Fuller)',
      description: 'Khung xương to, phân bổ khối lượng đều toàn thân',
      betas: [1.6, -0.3, 1.1, 1.2, 1.4, 0.4, 0.8, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.45,
        morph_chest: 0.50,
        morph_biceps: 0.40,
        morph_thighs: 0.60,
        morph_buttocks: 0.65,
        morph_shoulders: 0.30
      },
      measurements: {
        height_cm: 170.0,
        weight_kg: 82.0,
        chest_cm: 106.0,
        waist_cm: 94.0,
        hip_cm: 108.0,
        shoulder_cm: 46.0,
        arm_length_cm: 54.0
      }
    },
    {
      id: 'large_abdomen',
      nameVi: 'Bụng to (Large Abdomen)',
      description: 'Mỡ tập trung chủ yếu ở vùng bụng và vòng eo',
      betas: [1.2, 0.0, 0.5, 1.8, 0.5, 0.0, 0.2, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 1.0,
        morph_chest: 0.25,
        morph_biceps: 0.15,
        morph_thighs: 0.30,
        morph_buttocks: 0.25,
        morph_shoulders: 0.0
      },
      measurements: {
        height_cm: 172.0,
        weight_kg: 80.0,
        chest_cm: 98.0,
        waist_cm: 102.0,
        hip_cm: 100.0,
        shoulder_cm: 44.0,
        arm_length_cm: 55.0
      }
    },
    {
      id: 'pear',
      nameVi: 'Dáng Quả lê (Pear Shape)',
      description: 'Nửa trên thon gọn, hông và đùi nở nang',
      betas: [0.5, 0.0, -0.4, 0.2, 1.9, -0.4, 0.0, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.20,
        morph_chest: 0.0,
        morph_biceps: 0.0,
        morph_thighs: 0.95,
        morph_buttocks: 0.90,
        morph_shoulders: 0.0
      },
      measurements: {
        height_cm: 168.0,
        weight_kg: 69.0,
        chest_cm: 88.0,
        waist_cm: 77.0,
        hip_cm: 108.0,
        shoulder_cm: 42.0,
        arm_length_cm: 53.0
      }
    },
    {
      id: 'hourglass',
      nameVi: 'Đồng hồ cát (Hourglass)',
      description: 'Ngực và hông nở đều, vòng eo thon nhỏ rõ rệt',
      betas: [0.7, 0.1, 1.4, -0.6, 1.5, 0.2, 0.1, 0.0, 0.0, 0.0],
      regionalMorphs: {
        morph_abdomen: 0.0,
        morph_chest: 0.90,
        morph_biceps: 0.10,
        morph_thighs: 0.50,
        morph_buttocks: 0.90,
        morph_shoulders: 0.20
      },
      measurements: {
        height_cm: 168.0,
        weight_kg: 64.0,
        chest_cm: 98.0,
        waist_cm: 68.0,
        hip_cm: 102.0,
        shoulder_cm: 43.0,
        arm_length_cm: 53.0
      }
    }
  ];

  createDefaultMorphs(): RegionalMorphValues {
    return {
      morph_abdomen: 0.0,
      morph_chest: 0.0,
      morph_biceps: 0.0,
      morph_thighs: 0.0,
      morph_buttocks: 0.0,
      morph_shoulders: 0.0
    };
  }

  getPreset(id: string): BodyShapePreset | undefined {
    return this.shapePresets.find(p => p.id === id);
  }
}
