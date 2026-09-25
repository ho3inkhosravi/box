import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Menu, X, Printer, ClipboardList, ArrowRight, LayoutGrid, Save, Trash2, Bookmark } from 'lucide-react';
import { CutMapViewer } from './CutMapViewer';

const T_MDF = 1.6;
const PVC_THICK = 0.1;

interface CabinetPart {
  id: string;
  name: string;
  l: number;
  w: number;
  pL: number;
  pW: number;
  count: number;
  sx: number;
  sy: number;
  sz: number;
  cx: number;
  cy: number;
  cz: number;
  color: number;
  isDoor?: boolean;
  pvcFaces?: string[];
  cutL?: string;
  cutW?: string;
  pvcText?: string;
}

interface CabinetData {
  title: string;
  parts: CabinetPart[];
}

interface CabinetCalculatorProps {
  onClose?: () => void;
  onCutListUpdate?: (list: any[]) => void;
}

const getCutAndPvc = (baseL: number, baseW: number, pvc_L: number, pvc_W: number, deduct: boolean) => {
  let finalL = baseL;
  let finalW = baseW;
  if (deduct) {
    finalL = baseL - pvc_W * PVC_THICK;
    finalW = baseW - pvc_L * PVC_THICK;
  }
  
  let displayL, displayW, displayPvcL, displayPvcW;
  if (finalL >= finalW) {
    displayL = finalL;
    displayW = finalW;
    displayPvcL = pvc_L;
    displayPvcW = pvc_W;
  } else {
    displayL = finalW;
    displayW = finalL;
    displayPvcL = pvc_W;
    displayPvcW = pvc_L;
  }
  
  return { 
    L: displayL.toFixed(1), 
    W: displayW.toFixed(1),
    pL: displayPvcL,
    pW: displayPvcW
  };
};

const getPvcText = (pL: number, pW: number) => {
  if (pL === 0 && pW === 0) return 'خام';
  const t = [];
  if (pL > 0) t.push(pL + ' طول');
  if (pW > 0) t.push(pW + ' عرض');
  return t.join(' ، ');
};

const getCabinetsData = (win_val: number): Record<string, CabinetData> => {
  const w_out = win_val + 2 * T_MDF;
  // Distinct vibrant colors for each part
  const cTopBottom = 0x3b82f6; // blue-500
  const cBack = 0x10b981;      // emerald-500
  const cSides = 0xf59e0b;     // amber-500
  const cDividers = 0xec4899;  // pink-500
  const cDoor = 0x8b5cf6;      // violet-500
  const cFiller = 0x06b6d4;    // cyan-500

  return {
    upper: {
      title: 'باکس ماینر بالا (باکس شماره ۱)',
      parts: [
        { id: 'AB', name: 'سقف باکس (AB)', l: w_out, w: 83.0, pL: 1, pW: 2, count: 1, sx: w_out, sy: T_MDF, sz: 83.0, cx: 0, cy: 62.6 - T_MDF / 2, cz: 83 / 2 + T_MDF, color: cTopBottom, pvcFaces: ['+z', '+x', '-x'] },
        { id: 'AE', name: 'ورق پشت (AE)', l: w_out, w: 62.6, pL: 2, pW: 2, count: 1, sx: w_out, sy: 62.6, sz: T_MDF, cx: 0, cy: 62.6 / 2, cz: T_MDF / 2, color: cBack, pvcFaces: ['+x', '-x', '+y', '-y'] },
        { id: 'ABEK', name: 'دیواره چپ و راست (ABEK)', l: 83.0, w: 61.0, pL: 1, pW: 1, count: 2, sx: T_MDF, sy: 61.0, sz: 83.0, cx: 0, cy: 61.0 / 2, cz: 83 / 2 + T_MDF, color: cSides, pvcFaces: ['+y', '+z'] },
        { id: 'xy', name: 'جداکننده عمودی (xy)', l: win_val, w: 30.0, pL: 1, pW: 0, count: 1, sx: win_val, sy: 30.0, sz: T_MDF, cx: 0, cy: 61.0 - 15.0, cz: 50.0, color: cDividers, pvcFaces: ['+y'] },
        { id: 'yz', name: 'طبقه افقی (yz)', l: win_val, w: 40.0, pL: 1, pW: 0, count: 1, sx: win_val, sy: T_MDF, sz: 40.0, cx: 0, cy: 31.8, cz: 29.2, color: cTopBottom, pvcFaces: ['+z'] },
        { id: 'UZ', name: 'صداگیر عمودی پشت (UZ)', l: win_val, w: 10.4, pL: 1, pW: 0, count: 1, sx: win_val, sy: 10.4, sz: T_MDF, cx: 0, cy: 37.8, cz: 10.0, color: cDividers, pvcFaces: ['+y'] },
        { id: 'BF', name: 'درب جلو (BF)', l: w_out, w: 57.6, pL: 2, pW: 2, count: 1, sx: w_out, sy: 57.6, sz: T_MDF, cx: 0, cy: 5.0 + 57.6 / 2, cz: 84.6 + T_MDF / 2, color: cDoor, isDoor: true, pvcFaces: ['+x', '-x', '+y', '-y'] },
        { id: 'FK', name: 'فیلر پایینی (FK)', l: w_out, w: 5.0, pL: 2, pW: 2, count: 1, sx: w_out, sy: 5.0, sz: T_MDF, cx: 0, cy: 5.0 / 2, cz: 84.6 + T_MDF / 2, color: cFiller, pvcFaces: ['+x', '-x', '+y', '-y'] },
      ],
    },
    lower: {
      title: 'باکس ماینر پایین (باکس شماره ۲)',
      parts: [
        { id: 'GH', name: 'طاق سقف (GH)', l: w_out, w: 84.6, pL: 2, pW: 2, count: 1, sx: w_out, sy: T_MDF, sz: 84.6, cx: 0, cy: 50.2 - T_MDF / 2, cz: 84.6 / 2, color: cTopBottom, pvcFaces: ['+x', '-x', '+z', '-z'] },
        { id: 'CD', name: 'ورق کف (DC)', l: w_out, w: 84.6, pL: 1, pW: 2, count: 1, sx: w_out, sy: T_MDF, sz: 84.6, cx: 0, cy: T_MDF / 2, cz: 84.6 / 2, color: cTopBottom, pvcFaces: ['+z', '+x', '-x'] },
        { id: 'GHDC', name: 'دیواره چپ و راست (GHDC)', l: 84.6, w: 47.0, pL: 0, pW: 2, count: 2, sx: T_MDF, sy: 47.0, sz: 84.6, cx: 0, cy: 47.0 / 2 + T_MDF, cz: 84.6 / 2, color: cSides, pvcFaces: ['+z', '-z'] },
        { id: 'NM', name: 'جداکننده عمودی (NM)', l: win_val, w: 30.0, pL: 1, pW: 0, count: 1, sx: win_val, sy: 30.0, sz: T_MDF, cx: 0, cy: 33.6, cz: 50.0, color: cDividers, pvcFaces: ['+y'] },
        { id: 'RH', name: 'درب جلو (HR)', l: w_out, w: 29.2, pL: 2, pW: 2, count: 1, sx: w_out, sy: 29.2, sz: T_MDF, cx: 0, cy: 21.0 + 29.2 / 2, cz: 84.6 + T_MDF / 2, color: cDoor, isDoor: true, pvcFaces: ['+x', '-x', '+y', '-y'] },
        { id: 'HC', name: 'ورق ثابت پایین (RC)', l: w_out, w: 21.0, pL: 2, pW: 2, count: 1, sx: w_out, sy: 21.0, sz: T_MDF, cx: 0, cy: 21.0 / 2, cz: 84.6 + T_MDF / 2, color: cFiller, pvcFaces: ['+x', '-x', '+y', '-y'] },
      ],
    },
  };
};

interface BoxModelPreset {
  id: string;
  name: string;
  width: number;
}

export default function CabinetCalculator({ onClose, onCutListUpdate }: CabinetCalculatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mode, setMode] = useState<'upper' | 'lower'>('upper');
  const [width, setWidth] = useState<number>(105);
  const [deductPvc, setDeductPvc] = useState<boolean>(true);
  
  const [presets, setPresets] = useState<BoxModelPreset[]>(() => {
    try {
      const saved = localStorage.getItem('box_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [presetNameInput, setPresetNameInput] = useState('');
  
  const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 768);
  const [showLists, setShowLists] = useState(false);
  const [showCutMap, setShowCutMap] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const [hideDoors, setHideDoors] = useState(false);
  const [hideRightWall, setHideRightWall] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group>(new THREE.Group());
  const interactableMeshesRef = useRef<THREE.Mesh[]>([]);
  
  const selectedPartRef = useRef<any>(null);
  const unifiedCutListRef = useRef<any[]>([]);

  useEffect(() => {
    localStorage.setItem('box_presets', JSON.stringify(presets));
  }, [presets]);

  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: BoxModelPreset = {
      id: Date.now().toString(),
      name: presetNameInput.trim(),
      width: width,
    };
    setPresets([...presets, newPreset]);
    setPresetNameInput('');
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);

  useEffect(() => {
    if (interactableMeshesRef.current.length === 0) return;
    
    interactableMeshesRef.current.forEach((m) => {
      const mat = m.material as THREE.MeshBasicMaterial;
      const mId = m.userData.id;
      const isSelected = selectedPart && (selectedPart.ids ? selectedPart.ids.includes(mId) : mId === selectedPart.id);
      
      if (isSelected) {
        mat.opacity = 1.0;
        mat.color.setHex(0xf59e0b); // amber-500
      } else if (selectedPart) {
        mat.opacity = 0.15;
        mat.color.setHex(m.userData.origColor);
      } else {
        mat.opacity = m.userData.origOpacity;
        mat.color.setHex(m.userData.origColor);
      }
    });
  }, [selectedPart]);

  const data = useMemo(() => {
    const rawData = getCabinetsData(width);
    for (const key in rawData) {
      rawData[key].parts.forEach((p: any) => {
        const cut = getCutAndPvc(p.l, p.w, p.pL, p.pW, deductPvc);
        p.cutL = cut.L;
        p.cutW = cut.W;
        p.pvcText = getPvcText(cut.pL, cut.pW);
      });
    }
    return rawData;
  }, [width, deductPvc]);

  // Unified Bulletproof ThreeJS Initialization & Mesh Generation
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. Setup Scene
    const scene = new THREE.Scene();
    
    // 2. Setup Camera
    const cWidth = containerRef.current.clientWidth || window.innerWidth || 1;
    const cHeight = containerRef.current.clientHeight || window.innerHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, cWidth / cHeight, 1, 5000);
    
    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); 
    renderer.setSize(cWidth, cHeight);
    renderer.setClearColor(0x020617, 1); 
    
    // Force clean container and append
    containerRef.current.innerHTML = ''; 
    containerRef.current.appendChild(renderer.domElement);

    // 4. Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1500;
    controls.minDistance = 10;

    // 5. Setup Lighting & Helpers
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(200, 300, 400);
    scene.add(dirLight1);

    // 6. Generate Meshes
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    
    const interactableMeshes: THREE.Mesh[] = [];
    let currentIntersected: THREE.Mesh | null = null;
    setSelectedPart(null);

    const w_out = width + 2 * T_MDF;
    const parts = data[mode].parts;

    parts.forEach((p: any) => {
      let positions = [];
      if (p.id === 'ABEK' || p.id === 'GHDC') {
        positions.push({ x: -w_out / 2 + T_MDF / 2, y: p.cy, z: p.cz, isRight: false });
        positions.push({ x: w_out / 2 - T_MDF / 2, y: p.cy, z: p.cz, isRight: true });
      } else {
        positions.push({ x: p.cx, y: p.cy, z: p.cz, isRight: false });
      }

      positions.forEach((pos) => {
        if (p.isDoor && hideDoors) return;
        if (pos.isRight && hideRightWall) return;

        const geo = new THREE.BoxGeometry(p.sx, p.sy, p.sz);
        const mat = new THREE.MeshBasicMaterial({
          color: p.color,
          transparent: true,
          opacity: p.isDoor ? 0.15 : 0.25,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos.x, pos.y, pos.z);

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: p.color, linewidth: 2, transparent: true, opacity: 0.8 })
        );
        mesh.add(edges);

        // PVC Visualizer Planes
        if (p.pvcFaces) {
          const pvcMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
          p.pvcFaces.forEach((face: string) => {
            let pGeo;
            let pMesh;
            const offset = 0.05;
            if (face === '+x') {
              pGeo = new THREE.PlaneGeometry(p.sz, p.sy);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.rotation.y = Math.PI / 2;
              pMesh.position.x = p.sx / 2 + offset;
            } else if (face === '-x') {
              pGeo = new THREE.PlaneGeometry(p.sz, p.sy);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.rotation.y = -Math.PI / 2;
              pMesh.position.x = -p.sx / 2 - offset;
            } else if (face === '+y') {
              pGeo = new THREE.PlaneGeometry(p.sx, p.sz);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.rotation.x = -Math.PI / 2;
              pMesh.position.y = p.sy / 2 + offset;
            } else if (face === '-y') {
              pGeo = new THREE.PlaneGeometry(p.sx, p.sz);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.rotation.x = Math.PI / 2;
              pMesh.position.y = -p.sy / 2 - offset;
            } else if (face === '+z') {
              pGeo = new THREE.PlaneGeometry(p.sx, p.sy);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.position.z = p.sz / 2 + offset;
            } else if (face === '-z') {
              pGeo = new THREE.PlaneGeometry(p.sx, p.sy);
              pMesh = new THREE.Mesh(pGeo, pvcMat);
              pMesh.rotation.y = Math.PI;
              pMesh.position.z = -p.sz / 2 - offset;
            }
            if (pMesh) mesh.add(pMesh);
          });
        }

        mesh.userData = {
          id: p.id,
          name: p.name,
          cutL: p.cutL,
          cutW: p.cutW,
          count: p.count,
          pvc: p.pvcText,
          origColor: p.color,
          origOpacity: p.isDoor ? 0.15 : 0.25,
        };

        meshGroup.add(mesh);
        interactableMeshes.push(mesh);
      });
    });

    interactableMeshesRef.current = interactableMeshes;

    // 7. Recenter Camera
    const box = new THREE.Box3().setFromObject(meshGroup);
    const center = box.isEmpty() ? new THREE.Vector3(0,0,0) : box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    camera.position.set(center.x + 150, center.y + 100, center.z + 200);
    controls.update();

    // 8. Animation Loop
    let animationFrameId: number;
    const vector = new THREE.Vector3();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      // Update Label Positions
      const points = mode === 'upper' ? [
        { id: 'A', x: w_out/2, y: 61.0, z: 0.0 },
        { id: 'B', x: w_out/2, y: 61.0, z: 83.0 },
        { id: 'E', x: w_out/2, y: 0.0, z: 0.0 },
        { id: 'K', x: w_out/2, y: 0.0, z: 83.0 },
        { id: 'x', x: w_out/2, y: 61.0, z: 50.0 },
        { id: 'y', x: w_out/2, y: 31.0, z: 50.0 },
        { id: 'U', x: w_out/2, y: 43.0, z: 9.2 },
        { id: 'Z', x: w_out/2, y: 32.6, z: 9.2 },
        { id: 'F', x: w_out/2, y: 5.0, z: 84.6 },
      ] : [
        { id: 'G', x: w_out/2, y: 48.6, z: 0.0 },
        { id: 'H', x: w_out/2, y: 48.6, z: 84.6 },
        { id: 'D', x: w_out/2, y: 1.6, z: 0.0 },
        { id: 'C', x: w_out/2, y: 1.6, z: 84.6 },
        { id: 'N', x: w_out/2, y: 48.6, z: 50.0 },
        { id: 'M', x: w_out/2, y: 18.6, z: 50.0 },
        { id: 'R', x: w_out/2, y: 21.0, z: 84.6 },
      ];

      points.forEach(pt => {
        const el = document.getElementById(`label-${pt.id}`);
        if (el) {
          vector.set(pt.x, pt.y, pt.z);
          vector.project(camera);
          if (vector.z > 1) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
            el.style.left = `${(vector.x * .5 + .5) * cWidth}px`;
            el.style.top = `${(vector.y * -.5 + .5) * cHeight}px`;
          }
        }
      });
    };
    animate();

    // 9. Resize & Interaction Handlers
    const handleResize = () => {
      const rw = containerRef.current?.clientWidth || window.innerWidth;
      const rh = containerRef.current?.clientHeight || window.innerHeight;
      if (rw === 0 || rh === 0) return;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    };
    window.addEventListener('resize', handleResize);
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const target = event.target as HTMLElement;
      if (target.closest('.no-raycast')) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableMeshes);

      if (intersects.length > 0) {
        const currentId = selectedPartRef.current?.id;
        let currentIndex = intersects.findIndex(ix => ix.object.userData.id === currentId);
        let nextIndex = (currentIndex + 1) % intersects.length;
        const object = intersects[nextIndex].object as THREE.Mesh;
        
        currentIntersected = object;
        const partInList = unifiedCutListRef.current.find((p: any) => p.ids ? p.ids.includes(object.userData.id) : p.id === object.userData.id);
        
        if (partInList) {
          setSelectedPart(partInList);
        } else {
          // Fallback if not found in list (e.g. doors or right wall that might be grouped differently)
          setSelectedPart({
            id: object.userData.id,
            name: object.userData.name,
            cutL: object.userData.cutL,
            cutW: object.userData.cutW,
            pvcText: object.userData.pvc,
            count: object.userData.count,
          });
        }
      } else {
        currentIntersected = null;
        setSelectedPart(null);
      }
    };
    
    containerRef.current.addEventListener('pointerdown', handlePointerDown);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('pointerdown', handlePointerDown);
        if (containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
      scene.clear();
    };
  }, [data, mode, width, hideDoors, hideRightWall]); // Everything reconstructs cleanly when these change

  const unifiedCutList = useMemo(() => {
    const list: any[] = [];
    Object.values(data).forEach((cabinet: any) => {
      cabinet.parts.forEach((p: any) => {
        const existing = list.find(x => x.cutL === p.cutL && x.cutW === p.cutW && x.pvcText === p.pvcText && x.boxName === cabinet.title);
        if (existing) {
          existing.count += p.count;
          if (!existing.ids.includes(p.id)) existing.ids.push(p.id);
          if (!existing.name.includes(p.name)) {
            existing.name = `${existing.name} + ${p.name}`;
          }
        } else {
          list.push({ ...p, ids: [p.id], boxName: cabinet.title });
        }
      });
    });
    unifiedCutListRef.current = list;
    return list;
  }, [data]);

  useEffect(() => {
    if (onCutListUpdate) {
      onCutListUpdate(unifiedCutList);
    }
  }, [unifiedCutList, onCutListUpdate]);

  const mapRectsForBin = useMemo(() => {
    return unifiedCutList.map(p => ({
      w: p.cutL,
      h: p.cutW,
      name: p.boxName ? `${p.boxName} - ${p.name}` : p.name,
      count: p.count,
      pL: p.pL,
      pW: p.pW
    }));
  }, [unifiedCutList]);

  const totalAreaM2 = useMemo(() => {
    let area = 0;
    unifiedCutList.forEach(p => {
      area += (parseFloat(p.cutL) * parseFloat(p.cutW) * p.count) / 10000;
    });
    return area.toFixed(2);
  }, [unifiedCutList]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-hidden font-sans flex items-center justify-center" dir="rtl">
      
      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 touch-none" 
        style={{ width: '100vw', height: '100vh', display: 'block' }} 
      />

      {/* 3D Labels */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {(mode === 'upper' ? ['A', 'B', 'E', 'K', 'x', 'y', 'U', 'Z', 'F'] : ['G', 'H', 'D', 'C', 'N', 'M', 'R']).map(id => (
          <div 
            key={id} 
            id={`label-${id}`}
            className="absolute text-amber-200 font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2"
            style={{ display: 'none' }}
          >
            {id}
          </div>
        ))}
      </div>

      {/* Back Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="no-raycast absolute top-4 left-4 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-slate-700 transition-colors print:hidden border border-slate-700"
        >
          <ArrowRight size={20} />
          بازگشت به پنل
        </button>
      )}

      {/* Menu Toggle */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="no-raycast absolute top-4 right-4 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-slate-700 transition-colors print:hidden border border-slate-700"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
        {menuOpen ? 'بستن' : 'تنظیمات باکس'}
      </button>

      {/* Side Panel */}
      <div 
        className={`no-raycast absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-md shadow-2xl z-10 p-6 pt-20 overflow-y-auto transform transition-transform duration-300 print:hidden border-l border-slate-800 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <h2 className="text-lg font-bold text-slate-200 border-b-2 border-indigo-500 pb-2 mb-4">نمایش باکس</h2>
        
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setMode('upper')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'upper' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
          >
            باکس بالا
          </button>
          <button 
            onClick={() => setMode('lower')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'lower' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
          >
            باکس پایین
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-200 border-b-2 border-indigo-500 pb-2 mb-4">ابعاد و برش</h2>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hideDoors}
              onChange={(e) => setHideDoors(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm font-bold text-slate-300">مخفی کردن درب‌ها (دید داخل)</span>
          </label>
          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hideRightWall}
              onChange={(e) => setHideRightWall(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm font-bold text-slate-300">مخفی کردن دیواره راست</span>
          </label>

          <label className="block text-sm font-bold text-slate-400 mb-2">طول داخلی باکس (cm):</label>
          <input 
            type="number" 
            value={width}
            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="w-full px-3 py-2 border border-slate-700 rounded-lg font-mono text-left bg-slate-900 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={deductPvc}
              onChange={(e) => setDeductPvc(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm font-bold text-amber-500">کسر ۱ میل نوار از ابعاد برش</span>
          </label>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Bookmark size={16} className="text-indigo-400" />
              ظرفیت‌های ذخیره شده
            </h3>
            
            {presets.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1 thin-scrollbar">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-2 hover:border-indigo-500 transition-colors group">
                    <div className="flex-1 cursor-pointer" onClick={() => setWidth(p.width)}>
                      <div className="text-sm font-bold text-slate-200">{p.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5" dir="ltr">{p.width} cm</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletePreset(p.id); }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="حذف مدل"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="نام (مثل: ۲۴ دستگاه)"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-900 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-600"
              />
              <button 
                onClick={handleSavePreset}
                disabled={!presetNameInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                title="ذخیره این طول"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => setShowLists(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
          >
            <ClipboardList size={20} /> مشاهده لیست سراسری برش
          </button>
          <button 
            onClick={() => setShowCutMap(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors border border-emerald-500"
          >
            <LayoutGrid size={20} /> پیش‌نمایش نقشه برش
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6 leading-relaxed">
          * برای مشاهده مشخصات دقیق، روی هر ورق در تصویر سه‌بعدی کلیک کنید.<br/>
          * با موس یا لمس می‌توانید تصویر را بچرخانید و زوم کنید.
        </p>
      </div>

      {/* Selected Part Bottom Info */}
      <div 
        className={`no-raycast absolute bottom-0 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-slate-900/95 backdrop-blur shadow-xl text-white p-5 rounded-t-2xl z-10 border-t-4 border-amber-400 transition-transform duration-300 print:hidden ${selectedPart ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {selectedPart && (
          <>
            <h3 className="text-amber-400 font-bold text-lg mb-3 pb-2 border-b border-dashed border-slate-600">
              {selectedPart.name}
            </h3>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-300">ابعاد نهایی برش:</span>
              <span className="font-mono text-lg font-bold" dir="ltr">{selectedPart.cutL} × {selectedPart.cutW}</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-300">وضعیت نوار PVC:</span>
              <span className="font-bold text-emerald-400">{selectedPart.pvcText}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">تعداد مورد نیاز:</span>
              <span className="font-bold text-indigo-300">{selectedPart.count} عدد</span>
            </div>
          </>
        )}
      </div>

      {/* Lists Modal / Print View */}
      <div className={`fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto ${showLists ? 'block' : 'hidden print:block'} print:static print:bg-white print:z-0`}>
        <div className="max-w-4xl mx-auto p-6 mt-10 print:mt-0 bg-slate-900 print:bg-transparent rounded-2xl shadow-2xl print:shadow-none border border-slate-800 print:border-none">
          <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6 print:hidden">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">لیست سراسری ابعاد برش باکس‌ها</h2>
              <p className="text-slate-400 text-sm font-bold">
                مساحت کل ورق‌های برش‌خورده (خالص): <span className="text-emerald-400 font-mono text-base ml-1">{totalAreaM2}</span> متر مربع
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 transition-colors">
                <Printer size={18} /> چاپ
              </button>
              <button onClick={() => setShowLists(false)} className="bg-slate-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-600 flex items-center gap-2 transition-colors border border-slate-600">
                <X size={18} /> بستن
              </button>
            </div>
          </div>

            <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">لیست سراسری ابعاد برش باکس‌ها</h2>
              <div className="text-sm font-bold text-slate-600">
                طول داخلی: <span dir="ltr">{width} cm</span> | 
                مساحت خالص: <span dir="ltr">{totalAreaM2} m²</span> |
                کسر PVC: <span>{deductPvc ? 'فعال (کسر شد)' : 'غیرفعال (اندازه خام)'}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border border-slate-700 print:border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-800 print:bg-slate-100 font-bold text-lg p-3 border-b border-slate-700 print:border-slate-300 text-slate-200 print:text-slate-800 flex justify-between">
                  <span>لیست تجمعی برش قطعات (برای نجار)</span>
                  <span className="text-indigo-400 print:text-indigo-600 font-mono" dir="ltr">{new Date().toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-slate-900 print:bg-slate-800 text-slate-400 print:text-white border-b border-slate-700 print:border-none">
                      <tr>
                        <th className="py-3 px-4 border-l border-slate-800 print:border-slate-700">بخش</th>
                        <th className="py-3 px-4 border-l border-slate-800 print:border-slate-700">قطعه</th>
                        <th className="py-3 px-4 border-l border-slate-800 print:border-slate-700">طول (cm)</th>
                        <th className="py-3 px-4 border-l border-slate-800 print:border-slate-700">عرض (cm)</th>
                        <th className="py-3 px-4 border-l border-slate-800 print:border-slate-700">نوار PVC</th>
                        <th className="py-3 px-4">تعداد کل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-200 bg-slate-900 print:bg-transparent">
                      {unifiedCutList.map((p, i) => (
                        <tr 
                          key={i} 
                          onClick={() => {
                            setSelectedPart(p);
                            setShowLists(false);
                          }}
                          className={`hover:bg-slate-800/50 print:hover:bg-slate-50 transition-colors cursor-pointer ${selectedPart && (selectedPart.ids ? selectedPart.ids.includes(p.id) : selectedPart.id === p.id) ? 'bg-indigo-900/40' : ''}`}
                        >
                          <td className="py-3 px-4 border-l border-slate-800 print:border-slate-200 font-bold text-indigo-400 print:text-indigo-600 text-xs">{p.boxName}</td>
                          <td className="py-3 px-4 border-l border-slate-800 print:border-slate-200 font-bold text-slate-300 print:text-slate-700">{p.name}</td>
                          <td className="py-3 px-4 border-l border-slate-800 print:border-slate-200 font-mono font-bold text-slate-100 print:text-black" dir="ltr">{p.cutL}</td>
                          <td className="py-3 px-4 border-l border-slate-800 print:border-slate-200 font-mono font-bold text-slate-100 print:text-black" dir="ltr">{p.cutW}</td>
                          <td className="py-3 px-4 border-l border-slate-800 print:border-slate-200 text-emerald-400 print:text-emerald-600 font-bold">{p.pvcText}</td>
                          <td className="py-3 px-4 font-bold text-indigo-400 print:text-indigo-600 text-lg">{p.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Cut Map Modal */}
      {showCutMap && (
        <CutMapViewer parts={mapRectsForBin} onClose={() => setShowCutMap(false)} />
      )}

    </div>
  );
}
