import { supabase } from './supabase';

/**
 * Supabase Storageへ画像をアップロードし、公開URLを返す関数
 * @param file アップロードする画像ファイル
 * @param userId ユーザーID（フォルダ分け用）
 * @param folder 種類ごとのサブフォルダ（avatars, covers, galleriesなど）
 * @returns 公開URL（失敗時はnull）
 */
export async function uploadImage(file: File, userId: string, folder: string = 'general'): Promise<string | null> {
  try {
    // 拡張子を取得し、ユニークなファイル名を生成
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    // Supabaseの "images" バケットにアップロード
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('画像アップロードエラー:', uploadError);
      throw uploadError;
    }

    // 公開URLを取得
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('画像のアップロードに失敗しました:', error);
    return null;
  }
}
