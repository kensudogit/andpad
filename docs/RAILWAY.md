# Railway デプロイ（ANDPAD）

**推奨: サービス 1 本** — Go API + Next.js を同一コンテナで動かします（`Dockerfile.unified` + `/railway.toml`）。

## 1. GitHub 連携でデプロイ（推奨）

1. [Railway](https://railway.com) で **New Project** → **Deploy from GitHub**
2. リポジトリ `andpad`（またはフォーク先）を選択
3. アプリサービスの **Settings**:

| 項目 | 値 |
|------|-----|
| **Root Directory** | **空**（リポジトリルート） |
| **Config file path** | `/railway.toml` |
| Builder | Dockerfile → `Dockerfile.unified` |

4. **+ New** → **Database** → **PostgreSQL**
5. アプリサービス（Postgres ではない方）の **Variables**:

| 変数 | 必須 | 内容 |
|------|------|------|
| `DATABASE_URL` | 必須 | Postgres の **Reference**（`${{Postgres.DATABASE_URL}}`） |
| `JWT_SECRET` | 必須 | 32 文字以上のランダム文字列（**API キー不可**。`sk-ant-` や `sk-proj-` で始まる値は誤り） |
| `OPENAI_API_KEY` | 任意 | AI チャットボット / AI Board（未設定時は設定案内メッセージを返します） |
| `CORS_ORIGINS` | 任意 | カスタムドメイン利用時のみ。未設定でも `RAILWAY_PUBLIC_DOMAIN` から自動設定されます |
| `APP_PUBLIC_URL` | 任意 | 同上。未設定時は `https://<your-domain>.up.railway.app` を自動使用 |

> **統合デプロイでは `API_URL` を設定しないでください。**  
> Next.js は同一コンテナ内の `127.0.0.1:8081` の API にプロキシします。

6. **Networking** → **Generate Domain**
7. `main`（または接続ブランチ）へ **git push** すると自動ビルド・デプロイされます
8. 確認:
   - `GET https://<domain>/health` → `{"ok":true,"service":"andpad-web",...}`
   - `GET https://<domain>/status` → PostgreSQL: connected
9. デモログイン（DB シード済み）: `demo@sakura-dental.jp` / `demo1234`

## 2. CLI（`railway link`）

`railway link` は対話式のため、**既存プロジェクト**へ接続する場合は Project ID を指定するのが確実です。

### 既存プロジェクトに接続

1. [Railway Dashboard](https://railway.com/dashboard) で ANDPAD プロジェクトを開く
2. **Settings** → **Project ID** をコピー
3. リポジトリルートで:

```powershell
cd C:\devlop\andpad
railway login
railway link -p <Project-ID>
railway variables set JWT_SECRET=your-long-random-secret
git push origin main
```

GitHub 未連携の場合は `railway up` でもデプロイできます。

### 新規プロジェクト

```powershell
cd C:\devlop\andpad
railway login
railway init
railway add -d postgres
railway variables set JWT_SECRET=your-long-random-secret
railway up
```

Dashboard で **Config file path** = `/railway.toml`、**Root Directory** = 空 を確認してください。

## 3. git push 時の挙動

| イベント | 動作 |
|------|------------|
| `main` へ push | `watchPatterns` に一致する変更で自動ビルド（`frontend/**`, `backend/**`, `graphql/**`, `scripts/**`, `Dockerfile.unified`） |
| マイグレーション追加 | 起動時に `schema_migrations` を確認し、未適用 SQL を自動実行 |
| ヘルスチェック | Next.js `/health` が 300 秒以内に `ok: true` を返すまで待機 |

## 4. 関連ファイル

| ファイル | 役割 |
|----------|------|
| `railway.toml` | ルートの Railway 設定（git デプロイ用） |
| `Dockerfile.unified` | Go 1.25 + Next.js 統合イメージ |
| `scripts/start-unified.sh` | Web 先行起動 + API バックグラウンド |
| `.env.railway.example` | 変数のメモ |
| `frontend/railway.toml` | Web のみの 2 サービス構成用（通常は未使用） |
| `backend/railway.toml` | API のみの 2 サービス構成用（通常は未使用） |

## 5. よくあるエラー

| 症状 | 原因 | 対処 |
|------|------|------|
| `postgresql not configured` | アプリサービスに `DATABASE_URL` がない | Variables → **+ New Variable** → Name: `DATABASE_URL` → **Add Reference** → Postgres → `DATABASE_URL` → Redeploy |
| ログインが「ログイン中…」のまま | 上記 + プロキシタイムアウト | `/status` で PostgreSQL: connected を確認 |
| `JWT_SECRET looks like an API key` | Anthropic/OpenAI キーを JWT_SECRET に設定 | JWT_SECRET をランダム文字列に変更。API キーは `OPENAI_API_KEY` へ |
| `Cannot reach API HTTP 503` | API 起動失敗（DB 未設定） | Deploy ログで `[unified] ERROR: DATABASE_URL` を確認 |
| ビルド失敗 | Root Directory が `frontend` や `backend` になっている | **空**に戻し `/railway.toml` を使用 |
| ビルド成功だがデプロイが 5 分以上「Deploying」 | Next.js が PORT で待ち受けていない（旧版は Go API 待ちで Web 未起動） | 最新 `start-unified.sh` で Redeploy。`/health` が通っても `/status` で PostgreSQL 未接続なら `DATABASE_URL` を Reference 設定 |
| `incompatible database` / `organizations table missing` | 別プロジェクトで使っていた Postgres を接続している | **新しい Postgres プラグイン**を追加し `DATABASE_URL` を差し替え（または public テーブルを全削除） |

PowerShell で JWT_SECRET 生成例:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Redeploy 後: `https://<domain>/status` → PostgreSQL: **connected** → ログイン `demo@sakura-dental.jp` / `demo1234`
