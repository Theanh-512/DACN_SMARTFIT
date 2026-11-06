import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface JointRotationMap {
  [jointName: string]: { x: number; y: number; z: number };
}

@Component({
  selector: 'app-body-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './body-viewer.component.html',
  styleUrls: ['./body-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyViewerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('canvasContainer', { static: true })
  canvasContainer!: ElementRef<HTMLDivElement>;

  // Model & Morph Targets
  @Input() glbUrl: string = '/assets/models/rigged/human_avatar_rigged_neutral.glb';
  @Input() betas: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  @Input() regionalMorphs: Record<string, number> = {};

  // Skeletal Rigging & Posing (Phase 3.6)
  @Input() jointRotations: JointRotationMap = {};
  @Input() isUnderwearVisible: boolean = true;
  @Input() activePosePreset: string = 'a_pose';

  // Appearance & Framing
  @Input() skinHex: string = '#E8C39E';
  @Input() cameraAngle: 'front' | 'quarter' | 'side' | 'back' = 'front';
  @Input() heightCm: number = 175;
  @Input() isDressed: boolean = false;
  @Input() garmentSize: string = 'M';
  @Input() garmentColorHex: string = '#19284B';
  @Input() garmentGlbUrl?: string;
  @Input() showHeatmap: boolean = false;

  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  modelBadgeText = signal<string>('SMPL RIGGED');
  isMock = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private modelHeight: number = 1.75;
  private avatarMesh: THREE.SkinnedMesh | THREE.Mesh | null = null;
  private underwearMesh: THREE.SkinnedMesh | null = null;
  private skeleton: THREE.Skeleton | null = null;
  private bonesMap: Map<string, THREE.Bone> = new Map();
  private avatarGroup: THREE.Group | null = null;
  private garmentGroup: THREE.Group | null = null;
  private skinMaterial!: THREE.MeshStandardMaterial;
  private underwearMaterial!: THREE.MeshStandardMaterial;
  private garmentMaterial!: THREE.MeshStandardMaterial;

  // Cached geometry data for fast CPU J-regressor updates
  private riggedConfig: any = null;
  private baseVertices: Float32Array | null = null;
  private morphDeltas: Float32Array[] = [];

  readonly targetNames = [
    'beta_0_mass',
    'beta_1_stature',
    'beta_2_chest',
    'beta_3_waist',
    'beta_4_hip',
    'beta_5_shoulder',
    'beta_6_arm_mass',
    'beta_7_torso_leg',
    'beta_8_head_neck',
    'beta_9_secondary',
    'morph_abdomen',
    'morph_chest',
    'morph_biceps',
    'morph_thighs',
    'morph_buttocks',
    'morph_shoulders'
  ];

  ngOnInit(): void {
    this.initThree();
    this.fetchRiggedConfig();
    this.loadGlbModel(this.glbUrl);
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['betas'] || changes['regionalMorphs']) {
      this.applyMorphTargets();
    }
    if (changes['jointRotations'] || changes['activePosePreset']) {
      this.applyJointRotations();
    }
    if (changes['isUnderwearVisible'] && this.underwearMesh) {
      this.underwearMesh.visible = this.isUnderwearVisible;
    }
    if (changes['skinHex'] && !changes['skinHex'].firstChange) {
      this.applySkinColor();
    }
    if (changes['cameraAngle'] && !changes['cameraAngle'].firstChange) {
      this.applyCameraAngle(this.cameraAngle);
    }
    if (changes['glbUrl'] && !changes['glbUrl'].firstChange) {
      this.loadGlbModel(this.glbUrl);
    }
    if (changes['isDressed'] || changes['garmentSize'] || changes['garmentGlbUrl'] || changes['showHeatmap']) {
      this.updateGarment();
    }
    if (changes['garmentColorHex']) {
      this.applyGarmentColor();
    }
  }

  public applyBetas(newBetas: number[]): void {
    this.betas = newBetas;
    this.applyMorphTargets();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.garmentGroup) {
      this.scene.remove(this.garmentGroup);
    }
    if (this.skinMaterial) {
      this.skinMaterial.dispose();
    }
    if (this.underwearMaterial) {
      this.underwearMaterial.dispose();
    }
    if (this.garmentMaterial) {
      this.garmentMaterial.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private fetchRiggedConfig(): void {
    fetch('/assets/data/smpl_rigged_config.json')
      .then(res => res.json())
      .then(data => {
        this.riggedConfig = data;
        if (this.skeleton && this.avatarMesh) {
          this.updateSkeletonJointPositions();
        }
      })
      .catch(err => {
        console.warn('Could not load smpl_rigged_config.json, using fallback:', err);
      });
  }

  private initThree(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16181d);

    // 2. Camera: framing distance according to ISO 8559 mannequin stature
    const initH = 1.75;
    const fovRad = (38 * Math.PI) / 180;
    const initDist = (initH / 2) / Math.tan(fovRad / 2) * 1.25;
    const targetY = initH / 2;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, targetY, initDist);

    // 3. Renderer with PBR support & ACES tone mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, targetY, 0);
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 5.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;

    // 5. Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 3, 2.5);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    fillLight.position.set(-2, 2, -1);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef3c7, 1.4);
    rimLight.position.set(0, 2.5, -2.5);
    this.scene.add(rimLight);

    // Grounding disc
    const groundGeo = new THREE.CircleGeometry(0.85, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x0d0e11,
      transparent: true,
      opacity: 0.75
    });
    const groundDisc = new THREE.Mesh(groundGeo, groundMat);
    groundDisc.rotation.x = -Math.PI / 2;
    groundDisc.position.y = 0.001;
    this.scene.add(groundDisc);

    // 6. Materials
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.skinHex),
      roughness: 0.62,
      metalness: 0.02
    });

    this.underwearMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf0f0f2),
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.garmentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.garmentColorHex),
      roughness: 0.82,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    this.animate();
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private loadGlbModel(url: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.avatarGroup) {
          this.scene.remove(this.avatarGroup);
        }

        this.avatarGroup = gltf.scene;
        this.avatarMesh = null;
        this.underwearMesh = null;
        this.skeleton = null;
        this.bonesMap.clear();

        // Find primary SkinnedMesh, Underwear SkinnedMesh, and Skeleton
        this.avatarGroup.traverse((child) => {
          if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
            const sm = child as THREE.SkinnedMesh;
            sm.castShadow = true;
            sm.receiveShadow = true;

            if (sm.name.toLowerCase().includes('underwear')) {
              this.underwearMesh = sm;
              this.underwearMesh.material = this.underwearMaterial;
              this.underwearMesh.visible = this.isUnderwearVisible;
            } else {
              this.avatarMesh = sm;
              this.skeleton = sm.skeleton;
            }
          } else if ((child as THREE.Mesh).isMesh && !this.avatarMesh) {
            this.avatarMesh = child as THREE.Mesh;
          }

          if ((child as THREE.Bone).isBone) {
            this.bonesMap.set(child.name, child as THREE.Bone);
          }
        });

        // Bounding Box3 calculation
        const box = new THREE.Box3().setFromObject(this.avatarGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        this.modelHeight = size.y;

        // Ground feet at Y = 0 and center X, Z
        this.avatarGroup.position.x = - (box.min.x + box.max.x) / 2;
        this.avatarGroup.position.y = - box.min.y;
        this.avatarGroup.position.z = - (box.min.z + box.max.z) / 2;

        const targetMesh = this.avatarMesh as (THREE.SkinnedMesh | THREE.Mesh | null);
        if (targetMesh) {
          if (targetMesh.geometry) {
            targetMesh.geometry.computeVertexNormals();
            const posAttr = targetMesh.geometry.attributes['position'];
            this.baseVertices = new Float32Array(posAttr.array);

            const morphPos = targetMesh.geometry.morphAttributes['position'] || [];
            this.morphDeltas = morphPos.map((attr: any) => new Float32Array(attr.array));
          }
          targetMesh.material = this.skinMaterial;
          this.skinMaterial.color.setStyle(this.skinHex);
        }

        this.modelBadgeText.set(this.skeleton ? 'SMPL 24-JOINT RIG' : 'SMPL MORPH');
        this.isMock.set(false);

        this.applyMorphTargets();
        this.applyJointRotations();

        this.scene.add(this.avatarGroup);
        this.updateCameraFraming(this.cameraAngle);

        if (this.isDressed) {
          this.updateGarment();
        }
        this.isLoading.set(false);
      },
      undefined,
      (err) => {
        console.error('Error loading avatar GLB:', err);
        // Fallback to Phase 3.5 base avatar if rigged model cannot be fetched
        if (url !== '/assets/models/human_avatar_a_pose.glb') {
          console.log('Falling back to /assets/models/human_avatar_a_pose.glb');
          this.loadGlbModel('/assets/models/human_avatar_a_pose.glb');
        } else {
          this.errorMessage.set('Không thể tải mô hình 3D. Đang khởi tạo mô hình thay thế.');
          this.createProceduralFallbackAvatar();
          this.isLoading.set(false);
        }
      }
    );
  }

  private createProceduralFallbackAvatar(): void {
    this.isMock.set(true);
    this.modelBadgeText.set('MOCK MODE');

    if (this.avatarGroup) {
      this.scene.remove(this.avatarGroup);
    }
    this.avatarGroup = new THREE.Group();

    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.65, 24);
    const torso = new THREE.Mesh(torsoGeo, this.skinMaterial);
    torso.position.y = 1.15;
    this.avatarGroup.add(torso);

    const headGeo = new THREE.SphereGeometry(0.11, 24, 24);
    const head = new THREE.Mesh(headGeo, this.skinMaterial);
    head.position.y = 1.62;
    this.avatarGroup.add(head);

    this.scene.add(this.avatarGroup);
  }

  /**
   * Applies all 16 morph targets (10 SMPL Betas + 6 Regional Morphs) to body and underwear meshes,
   * then triggers dynamic skeleton joint repositioning.
   */
  public applyMorphTargets(): void {
    const influences: number[] = new Array(16).fill(0);

    // 10 Betas
    for (let i = 0; i < Math.min(this.betas.length, 10); i++) {
      influences[i] = this.betas[i];
    }

    // 6 Regional Morphs
    influences[10] = this.regionalMorphs['morph_abdomen'] ?? 0;
    influences[11] = this.regionalMorphs['morph_chest'] ?? 0;
    influences[12] = this.regionalMorphs['morph_biceps'] ?? 0;
    influences[13] = this.regionalMorphs['morph_thighs'] ?? 0;
    influences[14] = this.regionalMorphs['morph_buttocks'] ?? 0;
    influences[15] = this.regionalMorphs['morph_shoulders'] ?? 0;

    // Apply to primary body mesh
    if (this.avatarMesh && this.avatarMesh.morphTargetInfluences) {
      for (let i = 0; i < Math.min(influences.length, this.avatarMesh.morphTargetInfluences.length); i++) {
        this.avatarMesh.morphTargetInfluences[i] = influences[i];
      }
    }

    // Apply to underwear mesh
    if (this.underwearMesh && this.underwearMesh.morphTargetInfluences) {
      for (let i = 0; i < Math.min(influences.length, this.underwearMesh.morphTargetInfluences.length); i++) {
        this.underwearMesh.morphTargetInfluences[i] = influences[i];
      }
    }

    // Update joint positions based on newly shaped vertices
    this.updateSkeletonJointPositions();
  }

  /**
   * Recalculates 24 joint locations via sparse J-regressor: J = sum(w_k * v_k)
   * and updates bone translations and inverse bind matrices.
   * Completely prevents skinning distortion when body shape/betas change!
   */
  public updateSkeletonJointPositions(): void {
    if (!this.skeleton || !this.riggedConfig || !this.baseVertices) return;

    const sparseJr = this.riggedConfig.sparse_j_regressor;
    const parents = this.riggedConfig.parents;
    if (!sparseJr || !parents) return;

    const influences: number[] = this.avatarMesh?.morphTargetInfluences || [];
    const numDeltas = this.morphDeltas.length;

    // Calculate deformed joint locations (24 x 3)
    const newJoints: THREE.Vector3[] = [];
    for (let j = 0; j < 24; j++) {
      const entries: Array<[number, number]> = sparseJr[j.toString()] || [];
      const J = new THREE.Vector3(0, 0, 0);

      for (let e = 0; e < entries.length; e++) {
        const [vIdx, w] = entries[e];
        const vOffset = vIdx * 3;

        let x = this.baseVertices[vOffset];
        let y = this.baseVertices[vOffset + 1];
        let z = this.baseVertices[vOffset + 2];

        // Add displacement deltas from active morph targets
        for (let m = 0; m < numDeltas; m++) {
          const inf = influences[m] || 0;
          if (inf !== 0) {
            const deltaArr = this.morphDeltas[m];
            x += inf * deltaArr[vOffset];
            y += inf * deltaArr[vOffset + 1];
            z += inf * deltaArr[vOffset + 2];
          }
        }

        J.x += w * x;
        J.y += w * y;
        J.z += w * z;
      }
      newJoints.push(J);
    }

    // Update bone rest positions and bone inverses
    for (let i = 0; i < 24; i++) {
      const bone = this.skeleton.bones[i];
      if (!bone) continue;

      const p = parents[i];
      if (p < 0) {
        bone.position.copy(newJoints[0]);
      } else {
        bone.position.subVectors(newJoints[i], newJoints[p]);
      }

      // Update inverse bind matrix
      if (this.skeleton.boneInverses[i]) {
        this.skeleton.boneInverses[i].makeTranslation(-newJoints[i].x, -newJoints[i].y, -newJoints[i].z);
      }
    }

    // Reapply user joint rotations and update skeleton
    this.applyJointRotations();
    this.skeleton.update();
  }

  /**
   * Applies 3-axis Euler rotations to skeleton bones with biological limits.
   */
  public applyJointRotations(): void {
    if (!this.skeleton) return;

    for (const bone of this.skeleton.bones) {
      const rot = this.jointRotations[bone.name];
      if (rot) {
        bone.rotation.set(
          THREE.MathUtils.degToRad(rot.x || 0),
          THREE.MathUtils.degToRad(rot.y || 0),
          THREE.MathUtils.degToRad(rot.z || 0)
        );
      } else {
        // Fallback default A-pose if no explicit rotation is set
        if (this.activePosePreset === 'a_pose') {
          if (bone.name === 'left_shoulder') {
            bone.rotation.set(0, 0, THREE.MathUtils.degToRad(-25));
          } else if (bone.name === 'right_shoulder') {
            bone.rotation.set(0, 0, THREE.MathUtils.degToRad(25));
          } else {
            bone.rotation.set(0, 0, 0);
          }
        } else if (this.activePosePreset === 't_pose') {
          bone.rotation.set(0, 0, 0);
        }
      }
    }
  }

  private applySkinColor(): void {
    if (this.skinMaterial) {
      this.skinMaterial.color.setStyle(this.skinHex);
      this.skinMaterial.needsUpdate = true;
    }
  }

  public updateGarment(): void {
    if (!this.isDressed) {
      if (this.garmentGroup) {
        this.scene.remove(this.garmentGroup);
        this.garmentGroup = null;
      }
      return;
    }

    let url = this.garmentGlbUrl;
    if (!url) {
      const sz = (this.garmentSize || 'M').toLowerCase();
      if (this.heightCm >= 179 && sz === 's') {
        url = '/assets/garments/fitted_s_180.glb';
      } else {
        url = `/assets/garments/fitted_${sz}.glb`;
      }
    }

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.garmentGroup) {
          this.scene.remove(this.garmentGroup);
          this.garmentGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.geometry) mesh.geometry.dispose();
            }
          });
        }
        this.garmentGroup = gltf.scene;
        if (this.avatarGroup) {
          this.garmentGroup.position.copy(this.avatarGroup.position);
        }
        this.garmentGroup.traverse((child) => {
          if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
            const sm = child as THREE.SkinnedMesh;
            if (this.skeleton) {
              sm.bind(this.skeleton, sm.bindMatrix);
            }
          }
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (url.includes('fitted_s_180') || this.showHeatmap) {
              // High tension / fit pressure visualization (Crimson red)
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xd92d4b),
                roughness: 0.65,
                metalness: 0.08,
                side: THREE.DoubleSide
              });
            } else {
              mesh.material = this.garmentMaterial;
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        if (!url.includes('fitted_s_180') && !this.showHeatmap) {
          this.applyGarmentColor();
        }
        this.scene.add(this.garmentGroup);
      },
      undefined,
      (err) => {
        console.warn('Garment GLB failed to load from primary path:', url, err);
        // Fallback to legacy path if hierarchical path fails
        if (url.includes('/sizes/')) {
          const sz = (this.garmentSize || 'M').toLowerCase();
          const fallback = `/assets/garments/fitted_${sz}.glb`;
          console.log('Attempting fallback to:', fallback);
          loader.load(fallback, (gltf) => {
            if (this.garmentGroup) this.scene.remove(this.garmentGroup);
            this.garmentGroup = gltf.scene;
            if (this.avatarGroup) this.garmentGroup.position.copy(this.avatarGroup.position);
            this.scene.add(this.garmentGroup);
          });
        }
      }
    );
  }

  private applyGarmentColor(): void {
    if (this.garmentMaterial) {
      this.garmentMaterial.color.setStyle(this.garmentColorHex);
      this.garmentMaterial.needsUpdate = true;
    }
  }

  public updateCameraFraming(angle: 'front' | 'quarter' | 'side' | 'back' = 'front'): void {
    if (!this.camera || !this.controls) return;

    const H = this.modelHeight || 1.75;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const distance = (H / 2) / Math.tan(fovRad / 2) * 1.25;
    const targetY = H / 2;

    this.controls.target.set(0, targetY, 0);

    switch (angle) {
      case 'front':
        this.camera.position.set(0, targetY, distance);
        break;
      case 'quarter': {
        const d45 = distance * Math.SQRT1_2;
        this.camera.position.set(d45, targetY, d45);
        break;
      }
      case 'side':
        this.camera.position.set(distance, targetY, 0);
        break;
      case 'back':
        this.camera.position.set(0, targetY, -distance);
        break;
    }
    this.controls.update();
  }

  public applyCameraAngle(angle: 'front' | 'quarter' | 'side' | 'back'): void {
    this.updateCameraFraming(angle);
  }

  public resetCamera(): void {
    this.updateCameraFraming('front');
  }

  private setupResizeObserver(): void {
    const container = this.canvasContainer.nativeElement;
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.renderer && this.camera) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });
    this.resizeObserver.observe(container);
  }
}
