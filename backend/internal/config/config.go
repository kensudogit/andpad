// Package config は Railway/ローカル向けの環境変数と SaaS セットアップ診断を読み込む。
package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

// Config はアプリ全体で共有するランタイム設定。
type Config struct {
	Port              string
	DatabaseURL       string
	DatabaseSource    string
	JWTSecret         string
	TokenTTLHours     int
	S3Endpoint        string
	S3Region          string
	S3Bucket          string
	S3AccessKey       string
	S3SecretKey       string
	S3PublicBaseURL   string
	S3ForcePathStyle  bool
	OpenAIAPIKey      string
	OpenAIModel       string
	AllowedOrigins    []string
	AppPublicURL      string
	EnableMemoryStore bool
	// SaaS microservice base URLs (gateway proxies GraphQL/REST when set).
	SaasDxURL         string
	SaasCrmURL        string
	SaasAttendanceURL string
	SaasContractURL   string
	SaasChatURL       string
	SaasRagURL        string
}

// Load は環境変数から Config を構築する（DB 未設定時はメモリストアへフォールバック可）。
func Load() Config {
	db, source := resolveDatabaseURL()
	jwt := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if jwt == "" {
		jwt = "dev-only-change-in-production"
	}
	ttl := 72
	if v := os.Getenv("JWT_TTL_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			ttl = n
		}
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	origins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		origins = nil
		for _, p := range strings.Split(raw, ",") {
			if t := strings.TrimSpace(p); t != "" {
				origins = append(origins, t)
			}
		}
	}
	if pub := railwayPublicOrigin(); pub != "" {
		origins = mergeOrigins(origins, pub)
	}
	appPublic := strings.TrimRight(strings.TrimSpace(envOr("APP_PUBLIC_URL", "http://localhost:3000")), "/")
	if appPublic == "http://localhost:3000" {
		if pub := railwayPublicOrigin(); pub != "" && IsRailway() {
			appPublic = pub
		}
	}
	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}
	// Railway 本番では原則 Postgres 必須。ローカルや明示フラグ時のみインメモリ。
	memoryExplicit := os.Getenv("USE_MEMORY_STORE") == "true"
	enableMemory := db == "" && (!IsRailway() || memoryExplicit)
	if memoryExplicit {
		enableMemory = true
	}
	return Config{
		Port:              port,
		DatabaseURL:       db,
		DatabaseSource:    source,
		JWTSecret:         jwt,
		TokenTTLHours:     ttl,
		S3Endpoint:        strings.TrimSpace(os.Getenv("S3_ENDPOINT")),
		S3Region:          envOr("S3_REGION", "auto"),
		S3Bucket:          strings.TrimSpace(os.Getenv("S3_BUCKET")),
		S3AccessKey:       strings.TrimSpace(os.Getenv("S3_ACCESS_KEY")),
		S3SecretKey:       strings.TrimSpace(os.Getenv("S3_SECRET_KEY")),
		S3PublicBaseURL:   strings.TrimRight(strings.TrimSpace(os.Getenv("S3_PUBLIC_BASE_URL")), "/"),
		S3ForcePathStyle:  os.Getenv("S3_FORCE_PATH_STYLE") == "true" || os.Getenv("S3_FORCE_PATH_STYLE") == "1",
		OpenAIAPIKey:      strings.TrimSpace(os.Getenv("OPENAI_API_KEY")),
		OpenAIModel:       model,
		AllowedOrigins:    origins,
		AppPublicURL:      appPublic,
		EnableMemoryStore: enableMemory,
		SaasDxURL:         envOr("SAAS_DX_URL", "http://127.0.0.1:8081"),
		SaasCrmURL:        envOr("SAAS_CRM_URL", "http://127.0.0.1:8082"),
		SaasAttendanceURL: envOr("SAAS_ATTENDANCE_URL", "http://127.0.0.1:8083"),
		SaasContractURL:   envOr("SAAS_CONTRACT_URL", "http://127.0.0.1:8084"),
		SaasChatURL:       envOr("SAAS_CHAT_URL", "http://127.0.0.1:8085"),
		SaasRagURL:        envOr("SAAS_RAG_URL", "http://127.0.0.1:8086"),
	}
}

// MicroservicesEnabled is true when SaaS traffic should go to separate services.
func (c Config) MicroservicesEnabled() bool {
	if os.Getenv("SAAS_MONOLITH") == "true" {
		return false
	}
	if os.Getenv("UNIFIED_DEPLOY") == "1" || os.Getenv("UNIFIED_DEPLOY") == "true" {
		return false
	}
	if os.Getenv("SAAS_MICROSERVICES") == "false" {
		return false
	}
	if c.saasEndpointsConflictWithGateway() {
		return false
	}
	return true
}

func (c Config) saasEndpointsConflictWithGateway() bool {
	gwKey := loopbackPortKey(c.Port)
	if gwKey == "" {
		return false
	}
	for _, raw := range []string{
		c.SaasDxURL, c.SaasCrmURL, c.SaasAttendanceURL,
		c.SaasContractURL, c.SaasChatURL, c.SaasRagURL,
	} {
		if key, ok := loopbackPortKeyFromURL(raw); ok && key == gwKey {
			return true
		}
	}
	return false
}

func loopbackPortKey(port string) string {
	port = strings.TrimSpace(port)
	if port == "" {
		return ""
	}
	return "loopback:" + port
}

func loopbackPortKeyFromURL(raw string) (string, bool) {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Host == "" {
		return "", false
	}
	host := strings.ToLower(u.Hostname())
	if host != "localhost" && host != "127.0.0.1" && host != "::1" {
		return "", false
	}
	port := u.Port()
	if port == "" {
		if u.Scheme == "https" {
			port = "443"
		} else {
			port = "80"
		}
	}
	return loopbackPortKey(port), true
}

// S3Enabled は動画プリサインドアップロードが利用可能か。
func (c Config) S3Enabled() bool {
	return c.S3Bucket != "" && c.S3AccessKey != "" && c.S3SecretKey != ""
}

func (c Config) OpenAIEnabled() bool {
	return c.OpenAIAPIKey != ""
}

// IsRailway は Railway 上で動作しているか（DB SSL・メモリストア方針の判定用）。
func IsRailway() bool {
	if os.Getenv("LOCAL_DEV") == "1" || strings.EqualFold(os.Getenv("LOCAL_DEV"), "true") {
		return false
	}
	return os.Getenv("RAILWAY_ENVIRONMENT") != "" ||
		os.Getenv("RAILWAY_PROJECT_ID") != "" ||
		os.Getenv("RAILWAY_SERVICE_ID") != ""
}

func railwayPublicOrigin() string {
	domain := strings.TrimSpace(os.Getenv("RAILWAY_PUBLIC_DOMAIN"))
	if domain == "" {
		return ""
	}
	return "https://" + strings.TrimRight(domain, "/")
}

func mergeOrigins(origins []string, extra ...string) []string {
	seen := make(map[string]bool, len(origins)+len(extra))
	out := make([]string, 0, len(origins)+len(extra))
	for _, o := range append(origins, extra...) {
		t := strings.TrimSpace(o)
		if t == "" || seen[t] {
			continue
		}
		seen[t] = true
		out = append(out, t)
	}
	return out
}

func envOr(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func envPresence(key string) string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return "empty"
	}
	if strings.Contains(raw, "${{") {
		return "unresolved"
	}
	return "set"
}

// SetupStatus は秘密情報を含まない SaaS 環境の診断マップを返す（/status 用）。
func SetupStatus(postgresConnected bool, dbSource string) map[string]any {
	jwt := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	out := map[string]any{
		"postgres":           postgresConnected,
		"databaseSource":     dbSource,
		"databaseUrl":        envPresence("DATABASE_URL"),
		"databasePrivateUrl": envPresence("DATABASE_PRIVATE_URL"),
		"pgHost":             envPresence("PGHOST"),
		"jwtSecret":          ternary(jwt != "", "set", "empty"),
		"openaiApiKey":       envPresence("OPENAI_API_KEY"),
		"railway":            IsRailway(),
	}
	if w := jwtSecretWarning(jwt); w != "" {
		out["jwtSecretWarning"] = w
	}
	if !postgresConnected && IsRailway() {
		out["hint"] = "andpad service → Variables → + New Variable → Reference → Postgres → DATABASE_URL. JWT_SECRET = random string (not API key). Redeploy."
	}
	if pub := railwayPublicOrigin(); pub != "" {
		out["publicUrl"] = pub
	}
	if postgresConnected && envPresence("OPENAI_API_KEY") != "set" {
		out["openaiHint"] = "AI チャットボット / AI Board 用に OPENAI_API_KEY を Variables に追加して Redeploy してください。"
	}
	return out
}

func jwtSecretWarning(jwt string) string {
	if jwt == "" {
		return "JWT_SECRET is empty"
	}
	if strings.HasPrefix(jwt, "sk-ant") || strings.HasPrefix(jwt, "sk-proj") || strings.HasPrefix(jwt, "sk-") {
		return "JWT_SECRET looks like an API key. Use a random string here; put OpenAI/Anthropic keys in OPENAI_API_KEY."
	}
	if jwt == "dev-only-change-in-production" {
		return "JWT_SECRET is still the dev default. Set a long random string on Railway."
	}
	return ""
}

func ternary(cond bool, a, b string) string {
	if cond {
		return a
	}
	return b
}

func resolveDatabaseURL() (string, string) {
	keys := []string{
		"DATABASE_URL",
		"DATABASE_PRIVATE_URL",
		"POSTGRES_URL",
		"POSTGRES_PRIVATE_URL",
	}
	for _, key := range keys {
		raw := strings.TrimSpace(os.Getenv(key))
		if raw == "" || strings.Contains(raw, "${{") {
			continue
		}
		return normalizeDatabaseURL(raw), key
	}
	if built, source, ok := databaseURLFromComponents(); ok {
		return normalizeDatabaseURL(built), source
	}
	return "", ""
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if v := strings.TrimSpace(os.Getenv(key)); v != "" && !strings.Contains(v, "${{") {
			return v
		}
	}
	return ""
}

func databaseURLFromComponents() (string, string, bool) {
	host := firstEnv("PGHOST", "POSTGRES_HOST")
	user := firstEnv("PGUSER", "POSTGRES_USER")
	password := firstEnv("PGPASSWORD", "POSTGRES_PASSWORD")
	dbName := firstEnv("PGDATABASE", "POSTGRES_DB", "POSTGRES_DATABASE")
	port := firstEnv("PGPORT", "POSTGRES_PORT")
	if port == "" {
		port = "5432"
	}
	if host == "" || user == "" {
		return "", "", false
	}
	if dbName == "" {
		dbName = "railway"
	}
	u := &url.URL{
		Scheme: "postgresql",
		Host:   fmt.Sprintf("%s:%s", host, port),
		Path:   "/" + dbName,
	}
	if password != "" {
		u.User = url.UserPassword(user, password)
	} else {
		u.User = url.User(user)
	}
	return u.String(), "PGHOST", true
}

// normalizeDatabaseURL は Railway 向けに sslmode=require を付与する（URL に無い場合）。
func normalizeDatabaseURL(raw string) string {
	if raw == "" {
		return ""
	}
	if strings.Contains(raw, "sslmode=") {
		return raw
	}
	if !IsRailway() && !strings.Contains(strings.ToLower(raw), "railway") {
		return raw
	}
	if strings.Contains(raw, "?") {
		return raw + "&sslmode=require"
	}
	return raw + "?sslmode=require"
}

// RailwayDatabaseRequiredError は Railway で DATABASE_URL 未設定のときに返す。
func RailwayDatabaseRequiredError() error {
	return fmt.Errorf(
		"DATABASE_URL is required on Railway: open the app service (not Postgres) → Variables → New Variable → Reference → Postgres DATABASE_URL, set JWT_SECRET, then Redeploy",
	)
}
