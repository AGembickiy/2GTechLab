"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const PRINTER_BUILD_SIZE_MM = {
  x: 256,
  y: 256,
  z: 256,
};

const AVAILABLE_COLORS = [
  { name: "Белый", hex: "#ffffff" },
  { name: "Чёрный", hex: "#020617" },
  { name: "Серый", hex: "#9ca3af" },
  { name: "Оранжевый", hex: "#f97316" },
];

type Props = {
  file: File | null;
  onVolumeChange?: (_volumeMm3: number, _volumeCm3: number) => void;
  onScaleChange?: (_scale: number) => void;
};

type SupportedType = "stl" | "obj" | "unknown";

type LoadedState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      geometry: THREE.BufferGeometry;
      volumeMm3: number;
      size: THREE.Vector3; // габариты модели в единицах файла
    };

function detectType(fileName: string | undefined): SupportedType {
  if (!fileName) return "unknown";
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".stl")) return "stl";
  if (lower.endsWith(".obj")) return "obj";
  return "unknown";
}

function computeVolume(geometry: THREE.BufferGeometry): number {
  const geom = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const posAttr = geom.getAttribute("position");
  if (!posAttr) return 0;

  let volume = 0;
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i += 3) {
    vA.fromBufferAttribute(posAttr, i);
    vB.fromBufferAttribute(posAttr, i + 1);
    vC.fromBufferAttribute(posAttr, i + 2);

    volume += vA.crossVectors(vB, vC).dot(vC) / 6;
  }

  return Math.abs(volume);
}

type ModelUnits = "mm" | "cm" | "m";

function computeMaxScaleForPrinter(size: THREE.Vector3, units: ModelUnits): number {
  // Конвертируем область печати в единицы модели
  const mmPerUnit = units === "mm" ? 1 : units === "cm" ? 10 : 1000;
  const buildX = PRINTER_BUILD_SIZE_MM.x / mmPerUnit;
  const buildY = PRINTER_BUILD_SIZE_MM.y / mmPerUnit;
  const buildZ = PRINTER_BUILD_SIZE_MM.z / mmPerUnit;

  const sx = size.x > 0 ? buildX / size.x : Infinity;
  const sy = size.y > 0 ? buildY / size.y : Infinity;
  const sz = size.z > 0 ? buildZ / size.z : Infinity;
  const result = Math.min(sx, sy, sz);
  if (!Number.isFinite(result) || result <= 0) return 1;
  return Math.max(0.1, result);
}

type PaintableMeshProps = {
  geometry: THREE.BufferGeometry;
  onFacePaint?: (_faceIndex: number) => void;
  scaleFactor: number;
  paintColor: THREE.Color;
};

function PaintableMesh({ geometry, onFacePaint, scaleFactor, paintColor }: PaintableMeshProps) {
  const [meshGeometry] = useState(() => {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    const pos = g.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color("#38bdf8");
    for (let i = 0; i < pos.count; i++) {
      colors[i * 3] = base.r;
      colors[i * 3 + 1] = base.g;
      colors[i * 3 + 2] = base.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  });

  const colorsAttr = meshGeometry.getAttribute("color") as THREE.BufferAttribute;

  const handlePointerDown = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const faceIndex = e.faceIndex ?? null;
    if (faceIndex == null) return;

    const colorArray = colorsAttr.array as Float32Array;
    const startVertex = faceIndex * 3;

    for (let i = 0; i < 3; i++) {
      const idx = (startVertex + i) * 3;
      colorArray[idx] = paintColor.r;
      colorArray[idx + 1] = paintColor.g;
      colorArray[idx + 2] = paintColor.b;
    }
    colorsAttr.needsUpdate = true;

    if (onFacePaint) onFacePaint(faceIndex);
  };

  return (
    <mesh geometry={meshGeometry} onPointerDown={handlePointerDown} scale={scaleFactor}>
      <meshStandardMaterial vertexColors metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

export default function ModelViewer3D({ file, onVolumeChange, onScaleChange }: Props) {
  const [state, setState] = useState<LoadedState>({ status: "idle" });
  const [scale, setScale] = useState(1);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [units, setUnits] = useState<ModelUnits>("mm");

  const type = useMemo<SupportedType>(() => detectType(file?.name), [file?.name]);

  useEffect(() => {
    if (!file || type === "unknown") {
      setState({ status: "idle" });
      if (onVolumeChange) onVolumeChange(0, 0);
      return;
    }

    let canceled = false;
    setState({ status: "loading" });

    async function load() {
      if (!file) {
        setState({ status: "idle" });
        if (onVolumeChange) onVolumeChange(0, 0);
        return;
      }

      try {
        if (type === "stl") {
          const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
          const loader = new STLLoader();
          const arrayBuffer = await file.arrayBuffer();
          const geometry = loader.parse(arrayBuffer);
          if (canceled) return;

          const geom = geometry.center();
          const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geom));
          const size = bbox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const normalized = geom.clone();
          normalized.scale(2 / maxDim, 2 / maxDim, 2 / maxDim);

          const volumeMm3 = computeVolume(geom);

          setState({ status: "ready", geometry: normalized, volumeMm3, size });
          if (onVolumeChange) onVolumeChange(volumeMm3, volumeMm3 / 1000);
        } else if (type === "obj") {
          const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
          const loader = new OBJLoader();

          const objectUrl = URL.createObjectURL(file);
          loader.load(
            objectUrl,
            async (obj) => {
              URL.revokeObjectURL(objectUrl);
              if (canceled) return;

              const BufferGeometryUtils = await import(
                "three/examples/jsm/utils/BufferGeometryUtils.js"
              );

              let merged: THREE.BufferGeometry | null = null;
              obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  const mesh = child as THREE.Mesh;
                  const g = mesh.geometry as THREE.BufferGeometry;
                  merged = merged
                    ? BufferGeometryUtils.mergeGeometries([merged, g])
                    : g.clone();
                }
              });

              if (!merged) {
                setState({ status: "error", message: "Не удалось получить геометрию из OBJ‑файла." });
                if (onVolumeChange) onVolumeChange(0, 0);
                return;
              }

              const mergedGeometry = merged as THREE.BufferGeometry;

              mergedGeometry.center();
              const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(mergedGeometry));
              const size = bbox.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z) || 1;
              const normalized = mergedGeometry.clone();
              normalized.scale(2 / maxDim, 2 / maxDim, 2 / maxDim);

              const volumeMm3 = computeVolume(mergedGeometry);

              setState({ status: "ready", geometry: normalized, volumeMm3, size });
              if (onVolumeChange) onVolumeChange(volumeMm3, volumeMm3 / 1000);
            },
            undefined,
            () => {
              URL.revokeObjectURL(objectUrl);
              if (canceled) return;
              setState({ status: "error", message: "Не удалось загрузить OBJ‑файл." });
              if (onVolumeChange) onVolumeChange(0, 0);
            },
          );
        }
      } catch (e) {
        if (canceled) return;
        setState({ status: "error", message: "Ошибка при разборе 3D‑файла." });
        if (onVolumeChange) onVolumeChange(0, 0);
      }
    }

    load();

    return () => {
      canceled = true;
    };
    // onVolumeChange умышленно не в зависимостях, чтобы не перезапускать загрузку при каждом рендере
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, type]);

  const minScale = 0.25;
  const maxScale =
    state.status === "ready" ? computeMaxScaleForPrinter(state.size, units) : 3;

  const handleScaleChange = (value: number) => {
    const clamped = Math.min(Math.max(value, minScale), maxScale);
    setScale(clamped);
    if (onScaleChange) onScaleChange(clamped);
  };

  const volumeText =
    state.status === "ready"
      ? `${(state.volumeMm3 / 1000).toFixed(2)} см³ (${state.volumeMm3.toFixed(0)} мм³)`
      : state.status === "loading"
        ? "Расчёт объёма..."
        : "Объём будет показан после загрузки модели.";

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-black/30">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        <span>3D‑предпросмотр модели</span>
        <span className="text-[10px] normal-case">Объём: {volumeText}</span>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-3 text-xs text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Единицы модели:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "mm", label: "мм", value: "mm" as ModelUnits },
              { id: "cm", label: "см", value: "cm" as ModelUnits },
              { id: "m", label: "м", value: "m" as ModelUnits },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setUnits(opt.value)}
                className={`h-6 rounded-full border px-3 text-[10px] font-medium ${
                  units === opt.value
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-[var(--border)] bg-black/40 text-[var(--muted)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="whitespace-nowrap">Масштаб модели (для печати)</span>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={0.05}
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-40"
          />
          <span className="w-20 text-right text-[10px]">
            {scale.toFixed(2)}×{" "}
            {state.status === "ready" && `допустимо до ${maxScale.toFixed(2)}×`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Цвет покраски граней:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-6 rounded-full border px-2 text-[10px] font-medium ${
                  selectedColor.hex === color.hex
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-[var(--border)] bg-black/40 text-[var(--muted)]"
                }`}
              >
                <span
                  className="mr-1 inline-block h-3 w-3 rounded-full border border-white/20 align-middle"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black/40">
          {!file && (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-[var(--muted)]">
              Выберите STL или OBJ‑файл, чтобы увидеть 3D‑предпросмотр.
            </div>
          )}

          {file && type === "unknown" && (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-[var(--muted)]">
              Формат файла не поддерживается. Поддерживаются STL и OBJ.
            </div>
          )}

          {file && type !== "unknown" && (
            <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
              <color attach="background" args={["#020617"]} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
              <gridHelper args={[6, 12, 0x475569, 0x1f2937]} position={[0, -1, 0]} />
              <OrbitControls enableDamping dampingFactor={0.08} />

              {state.status === "ready" && (
                <PaintableMesh
                  geometry={state.geometry}
                  scaleFactor={scale}
                  paintColor={new THREE.Color(selectedColor.hex)}
                />
              )}
            </Canvas>
          )}

          {file && state.status === "loading" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[var(--muted)]">
              Загрузка 3D‑модели и расчёт объёма...
            </div>
          )}

          {file && state.status === "error" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-red-400">
              {state.message}
            </div>
          )}
        </div>

        <div className="text-[10px] text-[var(--muted)]">
          Кликните по отдельным граням модели, чтобы выделить и покрасить их выбранным цветом.
        </div>
      </div>
    </div>
  );
}

