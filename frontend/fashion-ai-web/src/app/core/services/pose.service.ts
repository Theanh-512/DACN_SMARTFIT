import { Injectable } from '@angular/core';

export interface JointRotation {
  x: number; // Pitch in degrees
  y: number; // Yaw in degrees
  z: number; // Roll in degrees
}

export interface JointInfo {
  id: string;
  nameVi: string;
  category: 'head_neck' | 'arms' | 'spine' | 'legs';
  limits: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

export interface PosePreset {
  id: string;
  nameVi: string;
  description: string;
  rotations: Record<string, JointRotation>;
}

@Injectable({
  providedIn: 'root'
})
export class PoseService {
  readonly majorJoints: JointInfo[] = [
    {
      id: 'head',
      nameVi: 'Đầu (Head)',
      category: 'head_neck',
      limits: { min: [-35, -50, -35], max: [45, 50, 35] }
    },
    {
      id: 'neck',
      nameVi: 'Cổ (Neck)',
      category: 'head_neck',
      limits: { min: [-30, -45, -30], max: [40, 45, 30] }
    },
    {
      id: 'spine2',
      nameVi: 'Cột sống lưng (Spine)',
      category: 'spine',
      limits: { min: [-15, -15, -15], max: [25, 15, 15] }
    },
    {
      id: 'pelvis',
      nameVi: 'Khung chậu (Pelvis)',
      category: 'spine',
      limits: { min: [-20, -30, -20], max: [20, 30, 20] }
    },
    {
      id: 'left_shoulder',
      nameVi: 'Vai trái (L. Shoulder)',
      category: 'arms',
      limits: { min: [-80, -70, -90], max: [100, 70, 80] }
    },
    {
      id: 'right_shoulder',
      nameVi: 'Vai phải (R. Shoulder)',
      category: 'arms',
      limits: { min: [-80, -70, -80], max: [100, 70, 90] }
    },
    {
      id: 'left_elbow',
      nameVi: 'Khuỷu tay trái (L. Elbow)',
      category: 'arms',
      limits: { min: [0, -90, 0], max: [145, 90, 0] }
    },
    {
      id: 'right_elbow',
      nameVi: 'Khuỷu tay phải (R. Elbow)',
      category: 'arms',
      limits: { min: [0, -90, 0], max: [145, 90, 0] }
    },
    {
      id: 'left_wrist',
      nameVi: 'Cổ tay trái (L. Wrist)',
      category: 'arms',
      limits: { min: [-60, -20, -30], max: [60, 20, 30] }
    },
    {
      id: 'right_wrist',
      nameVi: 'Cổ tay phải (R. Wrist)',
      category: 'arms',
      limits: { min: [-60, -20, -30], max: [60, 20, 30] }
    },
    {
      id: 'left_hip',
      nameVi: 'Khớp háng trái (L. Hip)',
      category: 'legs',
      limits: { min: [-30, -20, -45], max: [90, 20, 30] }
    },
    {
      id: 'right_hip',
      nameVi: 'Khớp háng phải (R. Hip)',
      category: 'legs',
      limits: { min: [-30, -20, -30], max: [90, 20, 45] }
    },
    {
      id: 'left_knee',
      nameVi: 'Đầu gối trái (L. Knee)',
      category: 'legs',
      limits: { min: [0, 0, 0], max: [140, 0, 0] } // One-way backward flexion [0, 140] deg
    },
    {
      id: 'right_knee',
      nameVi: 'Đầu gối phải (R. Knee)',
      category: 'legs',
      limits: { min: [0, 0, 0], max: [140, 0, 0] } // One-way backward flexion [0, 140] deg
    },
    {
      id: 'left_ankle',
      nameVi: 'Cổ chân trái (L. Ankle)',
      category: 'legs',
      limits: { min: [-40, -20, -20], max: [30, 20, 20] }
    },
    {
      id: 'right_ankle',
      nameVi: 'Cổ chân phải (R. Ankle)',
      category: 'legs',
      limits: { min: [-40, -20, -20], max: [30, 20, 20] }
    }
  ];

  readonly presets: PosePreset[] = [
    {
      id: 'a_pose',
      nameVi: 'Tư thế A-pose (Mặc định)',
      description: 'Hai tay xuôi chéo góc 25 độ tự nhiên, chân đứng thẳng',
      rotations: {
        left_shoulder: { x: 0, y: 0, z: -25 },
        right_shoulder: { x: 0, y: 0, z: 25 },
        left_elbow: { x: 5, y: 0, z: 0 },
        right_elbow: { x: 5, y: 0, z: 0 }
      }
    },
    {
      id: 't_pose',
      nameVi: 'Tư thế T-pose chuẩn',
      description: 'Hai tay dang ngang 90 độ (Tư thế gốc rest-pose của SMPL)',
      rotations: {
        left_shoulder: { x: 0, y: 0, z: 0 },
        right_shoulder: { x: 0, y: 0, z: 0 },
        left_elbow: { x: 0, y: 0, z: 0 },
        right_elbow: { x: 0, y: 0, z: 0 }
      }
    },
    {
      id: 'standing',
      nameVi: 'Đứng thẳng xuôi tay',
      description: 'Hai tay khép sát thân người 45 độ, lưng thẳng',
      rotations: {
        left_shoulder: { x: 5, y: 0, z: -48 },
        right_shoulder: { x: 5, y: 0, z: 48 },
        left_elbow: { x: 8, y: 0, z: 0 },
        right_elbow: { x: 8, y: 0, z: 0 },
        spine2: { x: 3, y: 0, z: 0 }
      }
    },
    {
      id: 'arms_extended',
      nameVi: 'Dang tay phía trước',
      description: 'Hai cánh tay đưa thẳng về phía trước góc 70 độ',
      rotations: {
        left_shoulder: { x: 65, y: 10, z: -15 },
        right_shoulder: { x: 65, y: -10, z: 15 },
        left_elbow: { x: 10, y: 0, z: 0 },
        right_elbow: { x: 10, y: 0, z: 0 }
      }
    },
    {
      id: 'walking',
      nameVi: 'Bước chân đi bộ',
      description: 'Chân trái bước tới, chân phải lùi sau hơi chùng gối, tay đối xứng',
      rotations: {
        left_hip: { x: 28, y: 0, z: 0 },
        left_knee: { x: 12, y: 0, z: 0 },
        right_hip: { x: -22, y: 0, z: 0 },
        right_knee: { x: 38, y: 0, z: 0 },
        left_shoulder: { x: -18, y: 0, z: -20 },
        right_shoulder: { x: 25, y: 0, z: 20 },
        left_elbow: { x: 25, y: 0, z: 0 },
        right_elbow: { x: 35, y: 0, z: 0 },
        pelvis: { x: 0, y: -6, z: 2 }
      }
    }
  ];

  getPreset(id: string): PosePreset | undefined {
    return this.presets.find(p => p.id === id);
  }

  clampRotation(jointId: string, rot: JointRotation): JointRotation {
    const info = this.majorJoints.find(j => j.id === jointId);
    if (!info) return rot;

    return {
      x: Math.max(info.limits.min[0], Math.min(info.limits.max[0], rot.x)),
      y: Math.max(info.limits.min[1], Math.min(info.limits.max[1], rot.y)),
      z: Math.max(info.limits.min[2], Math.min(info.limits.max[2], rot.z))
    };
  }

  createDefaultRotations(): Record<string, JointRotation> {
    const res: Record<string, JointRotation> = {};
    for (const j of this.majorJoints) {
      res[j.id] = { x: 0, y: 0, z: 0 };
    }
    // Default to A-pose
    res['left_shoulder'] = { x: 0, y: 0, z: -25 };
    res['right_shoulder'] = { x: 0, y: 0, z: 25 };
    return res;
  }
}
