'use client';

import { createWorker, Worker } from 'tesseract.js';

let workerInstance: Worker | null = null;

export interface OcrProgress {
  status: string;
  progress: number; // 0-1
}

/**
 * 初始化 Tesseract worker（中文 + 英文）
 * 首次调用会下载语言包（约 10MB），后续复用
 */
async function getWorker(onProgress?: (p: OcrProgress) => void): Promise<Worker> {
  if (workerInstance) return workerInstance;

  workerInstance = await createWorker(['chi_sim', 'eng'], 1, {
    logger: (m) => {
      if (onProgress && typeof m.progress === 'number') {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });

  return workerInstance;
}

/**
 * 对图片执行 OCR 识别
 * @param image 图片文件或 URL
 * @param onProgress 进度回调
 * @returns 识别出的文本
 */
export async function recognizeImage(
  image: File | string,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  try {
    const worker = await getWorker(onProgress);
    const { data } = await worker.recognize(image);
    return data.text.trim();
  } catch (err) {
    console.error('[OCR] 识别失败:', err);
    throw new Error('OCR 识别失败，请手动输入');
  }
}

/**
 * 释放 worker 资源（页面卸载时调用）
 */
export async function terminateWorker() {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}
