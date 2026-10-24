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

  @Input() glbUrl: string = '/assets/models/human_avatar_a_pose.glb';
  @Input() betas: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  @Input() skinHex: string = '#E8C39E';
  @Input() cameraAngle: 'front' | 'quarter' | 'side' | 'back' = 'front';
  @Input() heightCm: number = 175;
  @Input() isDressed: boolean = false;
  @Input() garmentSize: string = 'M';
  @Input() garmentColorHex: string = '#19284B';
  @Input() garmentGlbUrl?: string;

  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  modelBadgeText = signal<string>('SMPL');
  isMock = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private modelHeight: number = 1.75;
  private avatarMesh: THREE.Mesh | null = null;
  private avatarGroup: THREE.Group | null = null;
  private garmentGroup: THREE.Group | null = null;
  private skinMaterial!: THREE.MeshStandardMaterial;
  private garmentMaterial!: THREE.MeshStandardMaterial;

  ngOnInit(): void {
    this.initThree();
    this.loadGlbModel(this.glbUrl);
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['betas'] && !changes['betas'].firstChange) {
      this.applyMorphTargets();
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
    if (changes['isDressed'] || changes['garmentSize'] || changes['garmentGlbUrl']) {
      this.updateGarment();
    }
    if (changes['garmentColorHex']) {
      this.applyGarmentColor();
    }
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
    if (this.garmentMaterial) {
      this.garmentMaterial.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16181d);

    // 2. Camera: khoảng cách = (chiều cao / 2) / tan(fov / 2) * 1.2, target = (0, chiều cao / 2, 0)
    const initH = 1.75;
    const fovRad = (38 * Math.PI) / 180;
    const initDist = (initH / 2) / Math.tan(fovRad / 2) * 1.2;
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
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go under ground

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

    // Grounding disc chạm sàn ở Y = 0
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

    // 6. Default Skin Material
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.skinHex),
      roughness: 0.65,
      metalness: 0.05
    });

    // 7. Parametric Garment Material
    this.garmentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.garmentColorHex),
      roughness: 0.82,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Start render loop
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
        // Remove old avatar group if exists
        if (this.avatarGroup) {
          this.scene.remove(this.avatarGroup);
        }

        this.avatarGroup = gltf.scene;
        this.avatarMesh = null;

        // Find primary avatar mesh with morph targets
        this.avatarGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 0) {
              this.avatarMesh = mesh;
            } else if (!this.avatarMesh) {
              this.avatarMesh = mesh;
            }
          }
        });

        // 1. Tính toán Bounding Box3 của mô hình người
        const box = new THREE.Box3().setFromObject(this.avatarGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        this.modelHeight = size.y;

        // Đặt chân chạm sàn (min Y = 0) và căn giữa theo X, Z bằng Box3
        this.avatarGroup.position.x = - (box.min.x + box.max.x) / 2;
        this.avatarGroup.position.y = - box.min.y;
        this.avatarGroup.position.z = - (box.min.z + box.max.z) / 2;

        const targetMesh = this.avatarMesh as THREE.Mesh | null;
        if (targetMesh) {
          if (targetMesh.geometry) {
            targetMesh.geometry.computeVertexNormals();
          }
          if (targetMesh.material) {
            const origMat = (Array.isArray(targetMesh.material) ? targetMesh.material[0] : targetMesh.material) as THREE.MeshStandardMaterial;
            this.skinMaterial = origMat;
            this.skinMaterial.color.setStyle(this.skinHex);
            this.skinMaterial.roughness = 0.65;
            this.skinMaterial.metalness = 0.05;
            this.skinMaterial.needsUpdate = true;
          }
          this.applyMorphTargets();
        }

        // Determine badge text: SMPL or SMPL-X
        this.isMock.set(false);
        if (url.toLowerCase().includes('smplx')) {
          this.modelBadgeText.set('SMPL-X');
        } else {
          this.modelBadgeText.set('SMPL');
        }

        this.scene.add(this.avatarGroup);

        // 2. Camera mặc định nhìn chính diện, khung theo chiều cao người
        this.updateCameraFraming(this.cameraAngle);

        if (this.isDressed) {
          this.updateGarment();
        }
        this.isLoading.set(false);
      },
      undefined,
      (err) => {
        console.error('Error loading avatar GLB:', err);
        this.errorMessage.set('Không thể tải mô hình 3D. Đang khởi tạo mô hình thay thế.');
        this.createProceduralFallbackAvatar();
        this.isLoading.set(false);
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

    // Procedural simple humanoid mesh
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

  private applyMorphTargets(): void {
    if (!this.avatarMesh || !this.avatarMesh.morphTargetInfluences) return;

    for (let i = 0; i < Math.min(this.betas.length, this.avatarMesh.morphTargetInfluences.length); i++) {
      this.avatarMesh.morphTargetInfluences[i] = this.betas[i];
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
        }
        this.garmentGroup = gltf.scene;
        if (this.avatarGroup) {
          this.garmentGroup.position.copy(this.avatarGroup.position);
        }
        this.garmentGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = this.garmentMaterial;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        this.applyGarmentColor();
        this.scene.add(this.garmentGroup);
      },
      undefined,
      (err) => {
        console.warn('Garment GLB failed to load:', url, err);
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

    // Chiều cao mô hình thực tế từ Box3
    const H = this.modelHeight || 1.75;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    // Công thức: khoảng cách = (chiều cao / 2) / tan(fov / 2) nhân 1,2
    const distance = (H / 2) / Math.tan(fovRad / 2) * 1.2;
    // controls.target = (0, chiều cao / 2, 0)
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
