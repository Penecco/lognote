import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 認証が必要なページのパス
const PROTECTED_PATHS = ['/mypage', '/edit', '/tutorial'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保護対象のパスかチェック
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Supabaseのセッションクッキーを確認
  // sb-<project-ref>-auth-token という名前のクッキーが存在するかで判定
  const cookies = request.cookies;
  const hasAuthCookie = Array.from(cookies.getAll()).some(
    cookie => cookie.name.includes('auth-token') || cookie.name.includes('sb-')
  );

  if (!hasAuthCookie) {
    // 認証クッキーがない場合はトップページにリダイレクト
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mypage/:path*', '/edit/:path*', '/tutorial/:path*'],
};
