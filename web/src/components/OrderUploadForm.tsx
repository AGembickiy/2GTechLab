"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

type FileWithPreview = {
  file: File;
  previewUrl?: string;
  originalFile?: File;
  isConvertedToStl?: boolean;
  convertStatus?: "idle" | "converting" | "converted" | "failed";
  convertError?: string;
};

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

function isImageFile(name: string) {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getFileExtension(name: string) {
  const match = /\.([^.]+)$/.exec(name.toLowerCase());
  return match ? match[1] : "";
}

function is3DModelFile(name: string) {
  const lower = name.toLowerCase();
  return [
    ".stl",
    ".obj",
    ".step",
    ".stp",
    ".igs",
    ".iges",
    ".fbx",
    ".dae",
    ".gltf",
    ".glb",
    ".blend",
    ".skp",
    ".wrl",
    ".vrml",
  ].some((ext) => lower.endsWith(ext));
}

async function convertToStlIfPossible(file: File): Promise<File | null> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".stl")) return null; // уже STL, конвертация не нужна

  try {
    const arrayBuffer = await file.arrayBuffer();
    let root: any = null;

    if (name.endsWith(".obj")) {
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
      const loader: any = new OBJLoader();
      const text = new TextDecoder().decode(arrayBuffer);
      root = loader.parse(text);
    } else if (name.endsWith(".gltf") || name.endsWith(".glb")) {
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const loader: any = new GLTFLoader();

      root = await new Promise<any>((resolve, reject) => {
        if (name.endsWith(".glb")) {
          loader.parse(
            arrayBuffer,
            "",
            (gltf: any) => resolve(gltf.scene),
            (err: unknown) => reject(err),
          );
        } else {
          const text = new TextDecoder().decode(arrayBuffer);
          loader.parse(
            text,
            "",
            (gltf: any) => resolve(gltf.scene),
            (err: unknown) => reject(err),
          );
        }
      });
    } else if (name.endsWith(".fbx")) {
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
      const loader: any = new FBXLoader();
      root = loader.parse(arrayBuffer, "");
    } else if (name.endsWith(".dae")) {
      const { ColladaLoader } = await import("three/examples/jsm/loaders/ColladaLoader.js");
      const loader: any = new ColladaLoader();
      const text = new TextDecoder().decode(arrayBuffer);
      const collada = loader.parse(text, "");
      root = collada.scene;
    } else {
      // для других форматов пока автоконвертация не реализована
      return null;
    }

    if (!root) return null;

    const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
    const exporter: any = new STLExporter();
    const result = exporter.parse(root, { binary: true }) as ArrayBuffer | string;

    const stlArrayBuffer =
      result instanceof ArrayBuffer ? result : new TextEncoder().encode(result);

    const blob = new Blob([stlArrayBuffer], { type: "model/stl" });
    const newName = file.name.replace(/\.[^./\\]+$/, ".stl");
    return new File([blob], newName, { type: "model/stl" });
  } catch {
    return null;
  }
}

const ModelViewer3D = dynamic(() => import("./ModelViewer3D"), { ssr: false });

export default function OrderUploadForm() {
  const [modelFiles, setModelFiles] = useState<FileWithPreview[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<FileWithPreview[]>([]);
  const [modelVolume, setModelVolume] = useState<{ mm3: number; cm3: number } | null>(null);
  const [modelScale, setModelScale] = useState<number | null>(null);
  const [mode, setMode] = useState<"model" | "sketch">("model");
  const primaryModelFile = useMemo(() => modelFiles[0]?.file ?? null, [modelFiles]);

  useEffect(() => {
    return () => {
      [...modelFiles, ...referenceFiles].forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      setModelFiles([]);
      setModelVolume(null);
      setModelScale(null);
      return;
    }

    // Сначала сохраняем исходные файлы
    setModelFiles(
      files.map((file) => ({
        file,
        originalFile: file,
        previewUrl: undefined,
        isConvertedToStl: false,
        convertStatus: "idle",
      })),
    );

    // Асинхронно пытаемся конвертировать 3D‑модели в STL для предпросмотра
    files.forEach(async (file, index) => {
      if (!is3DModelFile(file.name)) return;
      const lower = file.name.toLowerCase();

      // STL/OBJ рендерятся напрямую без конвертации
      if (lower.endsWith(".stl") || lower.endsWith(".obj")) return;

      // Для STEP/IGES сразу показываем заглушку без попытки конвертации.
      if ([".step", ".stp", ".igs", ".iges"].some((ext) => lower.endsWith(ext))) {
        setModelFiles((prev) => {
          if (!prev[index]) return prev;
          const next = [...prev];
          next[index] = {
            ...next[index],
            convertStatus: "failed",
            convertError:
              "STEP/IGES‑файлы загружаются без 3D‑предпросмотра. Для визуальной проверки используйте STL/OBJ.",
          };
          return next;
        });
        return;
      }

      setModelFiles((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = {
          ...next[index],
          convertStatus: "converting",
          convertError: undefined,
        };
        return next;
      });

      const converted = await convertToStlIfPossible(file);

      setModelFiles((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        if (converted) {
          next[index] = {
            ...next[index],
            file: converted,
            originalFile: file,
            isConvertedToStl: true,
            convertStatus: "converted",
            convertError: undefined,
          };
        } else {
          next[index] = {
            ...next[index],
            convertStatus: "failed",
            convertError:
              "Не удалось автоматически конвертировать этот формат в STL для предпросмотра. Файл всё равно будет доступен для заказа.",
          };
        }
        return next;
      });
    });
  };

  const handleReferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const next: FileWithPreview[] = files.map((file) => ({
      file,
      previewUrl: isImageFile(file.name) ? URL.createObjectURL(file) : undefined,
    }));

    referenceFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });

    setReferenceFiles(next);
  };

  return (
    <>
      <section className="mt-4 space-y-6 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.95)] lg:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Оформить заказ</h2>
          </div>
        </div>

        <div className="mt-10 text-xs text-[var(--muted)]">
          <div className="inline-flex flex-col">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300/80">
              Режим заявки:
            </h4>
            <button
              type="button"
              className={`order-mode-toggle mt-0.5 ${
                mode === "sketch" ? "order-mode-toggle--sketch" : ""
              }`}
              role="switch"
              aria-checked={mode === "sketch"}
              onClick={() => setMode(mode === "model" ? "sketch" : "model")}
            >
              <div className="order-mode-toggle__thumb" aria-hidden="true" />
              <div className="order-mode-toggle__labels">
                <span
                  className={`order-mode-toggle__label ${
                    mode === "model" ? "order-mode-toggle__label--active" : ""
                  }`}
                >
                  3D‑модель
                </span>
                <span
                  className={`order-mode-toggle__label ${
                    mode === "sketch" ? "order-mode-toggle__label--active" : ""
                  }`}
                >
                  Эскиз / фотографии
                </span>
              </div>
            </button>
          </div>
        </div>

        <form
          className="mt-4 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Левая колонка: в зависимости от режима показываем блок 3D‑модели или эскизов */}
          <div className="space-y-4">
            {mode !== "sketch" && (
              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  3D‑модель для печати
                </label>
                <label className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-[var(--border)] bg-black/40 px-4 py-3 transition-colors hover:border-[var(--accent)] hover:bg-black/60">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-black shadow-sm transition-colors group-hover:bg-[var(--accent-hover)]">
                      Загрузи файл 3D-модели
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".obj,.stl,.step,.stp,.igs,.iges,.fbx,.dae,.gltf,.glb,.blend,.skp,.wrl,.vrml"
                    onChange={handleModelsChange}
                    className="sr-only"
                  />
                </label>

                {modelFiles.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]">
                    {modelFiles.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start justify-between gap-3 rounded-lg bg-black/25 px-3 py-2"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded bg-black/40 px-1.5 py-[1px] text-[9px] font-semibold uppercase text-[var(--muted)]">
                              {getFileExtension(item.originalFile?.name ?? item.file.name) || "file"}
                            </span>
                            <span className="truncate">{item.originalFile?.name ?? item.file.name}</span>
                          </div>
                          {item.isConvertedToStl && (
                            <span className="truncate text-[10px] text-[var(--muted)]">
                              Для предпросмотра автоматически конвертировано в STL: {item.file.name}
                            </span>
                          )}
                          {item.convertStatus === "converting" && (
                            <span className="text-[10px] text-[var(--muted)]">
                              Выполняется конвертация в STL для предпросмотра...
                            </span>
                          )}
                          {item.convertStatus === "failed" && item.convertError && (
                            <span className="text-[10px] text-amber-300">{item.convertError}</span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {(item.file.size / 1024 / 1024).toFixed(2)} МБ
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {mode !== "model" && (
              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Эскизы / фотографии для примера
                </label>
                <label className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-[var(--border)] bg-black/40 px-4 py-3 transition-colors hover:border-[var(--accent)] hover:bg-black/60">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-xs text-[var(--muted)]">
                        PNG, JPG или WebP‑изображения помогут нам точнее понять желаемый результат.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-black shadow-sm transition-colors group-hover:bg-[var(--accent-hover)]">
                      Загрузить изображения
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleReferencesChange}
                    className="sr-only"
                  />
                </label>

                {referenceFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {referenceFiles.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-black/20"
                      >
                        {item.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="h-28 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-28 items-center justify-center px-2 text-center text-xs text-[var(--muted)]">
                            Предпросмотр недоступен
                          </div>
                        )}
                        <div className="border-t border-[var(--border)] px-2 py-1">
                          <p className="truncate text-xs text-[var(--foreground)]" title={item.file.name}>
                            {item.file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Правая колонка: 3D‑просмотр для режима модели или подсказки для эскизов */}
          <div className="space-y-3">
            {mode !== "sketch" ? (
              <>
                <ModelViewer3D
                  file={primaryModelFile}
                  onVolumeChange={(mm3, cm3) => {
                    if (!primaryModelFile) {
                      setModelVolume(null);
                      return;
                    }
                    setModelVolume({ mm3, cm3 });
                  }}
                  onScaleChange={(scale) => setModelScale(scale)}
                />

                {primaryModelFile && modelVolume && (
                  <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-black/25 p-3 text-xs text-[var(--foreground)] sm:grid-cols-2">
                    <div>
                      <div className="font-semibold text-[var(--muted)]">Объём модели</div>
                      <div className="mt-1">
                        ≈ {modelVolume.cm3.toFixed(2)} см³{" "}
                        <span className="text-[var(--muted)]">({modelVolume.mm3.toFixed(0)} мм³)</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--muted)]">Масштаб печати</div>
                      <div className="mt-1">
                        {modelScale ? `${modelScale.toFixed(2)}×` : "1.00×"}
                        <span className="ml-1 text-[var(--muted)]">
                          (ограничен областью печати 256×256×256 мм)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {modelFiles.length > 0 && (
                  <p className="text-[10px] text-[var(--muted)]">
                    Визуальный предпросмотр поддерживает STL/OBJ. Другие 3D‑форматы при возможности автоматически
                    конвертируются в STL только для предпросмотра; в заказ будет отправлен исходный файл.
                  </p>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col justify-center gap-2 rounded-xl border border-[var(--border)] bg-black/30 p-4 text-xs text-[var(--muted)]">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Режим работы с эскизами и фотографиями
                </span>
                <p>
                  Загрузите несколько изображений изделия под разными ракурсами, добавьте примеры текстур и цвета. По
                  этим материалам наши специалисты подготовят 3D‑модель и расчёт стоимости печати.
                </p>
              </div>
            )}
          </div>
        </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-[11px] text-[var(--muted)] sm:flex-row">
            <p>После проверки модели и параметров вы сможете оставить контакты и комментарии к заказу.</p>
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[var(--accent-hover)]"
            >
              Продолжить оформление заказа
            </button>
          </div>
        </form>
      </section>

    </>
  );
}

