import imageCompression from 'browser-image-compression';

/**
 * 压缩图片到 200KB 以内（控制 Supabase Storage 用量）
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.error('[图片压缩] 失败，返回原文件:', err);
    return file;
  }
}

/**
 * 上传图片到 Supabase Storage
 * @returns 公开访问 URL
 */
export async function uploadImage(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 未配置');
  }

  // 先压缩
  const compressed = await compressImage(file);

  // 生成唯一文件名
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${fileName}`;

  // 直接 fetch 上传（避免引入 supabase client 重复）
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/question-images/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': compressed.type || 'image/jpeg',
      },
      body: compressed,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`上传失败: ${response.status} ${errText}`);
  }

  // 返回公开 URL
  return `${supabaseUrl}/storage/v1/object/public/question-images/${path}`;
}
