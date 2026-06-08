// Package demo は org_demo 向けの共有カタログ定義（メモリ/Postgres シードの単一ソース）。
package demo

import "fmt"

// CatalogVideo はデモ動画のメタデータ。日本語は \u エスケープで全環境のソース互換を保つ。
type CatalogVideo struct {
	ID           string
	Title        string
	Description  string
	Category     string
	Procedure    string
	SkillLevel   string
	DurationSec  int
	YouTubeID    string
	InstructorID string
	Featured     bool
}

func (v CatalogVideo) EmbedURL() string {
	return fmt.Sprintf("https://www.youtube.com/embed/%s", v.YouTubeID)
}

func (v CatalogVideo) ThumbnailURL() string {
	return fmt.Sprintf("https://img.youtube.com/vi/%s/hqdefault.jpg", v.YouTubeID)
}

// CatalogVideos は org_demo に投入する全デモ動画一覧を返す。
func CatalogVideos() []CatalogVideo {
	return []CatalogVideo{
		{
			ID: "v-1", Title: "\u6839\u7ba1\u6cbb\u7642 Step1 - \u958b\u7a9e\u3068\u30a2\u30af\u30bb\u30b9",
			Description: "\u9069\u5207\u306a\u30a2\u30af\u30bb\u30b9\u7a9e\u5f62\u6210\u3068\u6839\u7ba1\u5165\u53e3\u306e\u78ba\u8a8d\u624b\u6280\u3092\u89e3\u8aac\u3057\u307e\u3059\u3002",
			Category: "ENDODONTICS", Procedure: "\u6839\u7ba1\u6cbb\u7642", SkillLevel: "BEGINNER", DurationSec: 720,
			YouTubeID: "JLeiDmOVfcg", InstructorID: "inst-1", Featured: true,
		},
		{
			ID: "v-2", Title: "\u30ef\u30fc\u30af\u9577\u6e2c\u5b9a\u3068\u96fb\u6c17\u9577\u6e2c\u5b9a\u5668\u306e\u4f7f\u3044\u65b9",
			Description: "APEX\u30ed\u30b1\u30fc\u30bf\u306e\u8aad\u307f\u53d6\u308a\u3068\u81e8\u5e8a\u5224\u65ad\u306e\u30dd\u30a4\u30f3\u30c8\u3002",
			Category: "ENDODONTICS", Procedure: "\u6839\u7ba1\u6cbb\u7642", SkillLevel: "INTERMEDIATE", DurationSec: 540,
			YouTubeID: "qCBDpi7cQz4", InstructorID: "inst-1", Featured: true,
		},
		{
			ID: "v-3", Title: "SRP \u57fa\u672c\u624b\u6280 - \u30b9\u30b1\u30fc\u30e9\u30fc\u306e\u89d2\u5ea6\u3068\u30b9\u30c8\u30ed\u30fc\u30af",
			Description: "\u6b6f\u77f3\u9664\u53bb\u306e\u57fa\u672c\u52d5\u4f5c\u3068\u60a3\u8005\u3078\u306e\u8aac\u660e\u306e\u30b3\u30c4\u3002",
			Category: "PERIODONTICS", Procedure: "SRP", SkillLevel: "BEGINNER", DurationSec: 600,
			YouTubeID: "LSJto5PVCoY", InstructorID: "inst-2", Featured: true,
		},
		{
			ID: "v-4", Title: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u57cb\u5165 - \u30d5\u30e9\u30c3\u30d7\u30c7\u30b6\u30a4\u30f3\u3068\u6cbb\u7642\u306e\u6d41\u308c",
			Description: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u6cbb\u7642\u306e\u5168\u4f53\u50cf\u3068\u57cb\u5165\u90e8\u4f4d\u306e\u6e96\u5099\u624b\u9806\u3092\u89e3\u8aac\u3057\u307e\u3059\u3002",
			Category: "IMPLANT", Procedure: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", SkillLevel: "ADVANCED", DurationSec: 900,
			YouTubeID: "g-i3P-D6p7M", InstructorID: "inst-3", Featured: true,
		},
		{
			ID: "v-5", Title: "\u5358\u72ec\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8 - \u6cbb\u7642\u8a08\u753b\u3068\u57cb\u5165\u306e\u8981\u70b9",
			Description: "\u5358\u72ec\u6b6f\u6b20\u640d\u3078\u306e\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u6cbb\u7642\u306e\u6d41\u308c\u3068\u5be9\u7f8e\u30fb\u6a5f\u80fd\u306e\u8003\u3048\u65b9\u3002",
			Category: "IMPLANT", Procedure: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", SkillLevel: "INTERMEDIATE", DurationSec: 660,
			YouTubeID: "8gVfdyASewA", InstructorID: "inst-3", Featured: false,
		},
		{
			ID: "v-6", Title: "\u611f\u67d3\u5bfe\u7b56 - \u6ec1\u83cc\u30b5\u30a4\u30af\u30eb\u3068\u30c8\u30ec\u30fc\u30b5\u30d3\u30ea\u30c6\u30a3",
			Description: "\u30af\u30e9\u30b9B\u30aa\u30fc\u30c8\u30af\u30ec\u30fc\u30d6\u904b\u7528\u306e\u6a19\u6e96\u624b\u9806\u3002",
			Category: "INFECTION_CONTROL", Procedure: "\u6ec1\u83cc", SkillLevel: "BEGINNER", DurationSec: 480,
			YouTubeID: "CO-CTNmpLc8", InstructorID: "inst-2", Featured: true,
		},
		{
			ID: "v-7", Title: "\u5c0f\u5150\u6b6f\u79d1 - \u521d\u8a3a\u306e\u6d41\u308c\u3068\u884c\u52d5\u7ba1\u7406\u306e\u57fa\u672c",
			Description: "\u4f4e\u4fb5\u8972\u3067\u8a3a\u7642\u3092\u9032\u3081\u308b\u305f\u3081\u306e\u58f0\u304b\u3051\u30fb\u30dd\u30b8\u30b7\u30e7\u30cb\u30f3\u30b0\u30fb\u4fdd\u8b77\u8005\u8aac\u660e\u306e\u8981\u70b9\u3002",
			Category: "PEDIATRIC", Procedure: "\u884c\u52d5\u7ba1\u7406", SkillLevel: "BEGINNER", DurationSec: 420,
			YouTubeID: "GGJRR5RsalU", InstructorID: "inst-2", Featured: true,
		},
		{
			ID: "v-8", Title: "\u629c\u6b6f - \u96e3\u629c\u6b6f\u306e\u5206\u5272\u3068\u30a8\u30ec\u30d9\u30fc\u30b7\u30e7\u30f3",
			Description: "\u30eb\u30fc\u30c8\u7834\u6298\u30ea\u30b9\u30af\u3092\u4e0b\u3052\u308b\u5206\u5272\u629c\u6b6f\u306e\u624b\u9806\u3002",
			Category: "ORAL_SURGERY", Procedure: "\u629c\u6b6f", SkillLevel: "ADVANCED", DurationSec: 840,
			YouTubeID: "oVSss3AgCt4", InstructorID: "inst-3", Featured: false,
		},
		{
			ID: "v-9", Title: "\u77ef\u6b63\u6cbb\u7642\u306e\u57fa\u790e - \u30d6\u30e9\u30b1\u30c3\u30c8\u306e\u4ed5\u7d44\u307f\u3068\u6cbb\u7642\u306e\u6d41\u308c",
			Description: "\u77ef\u6b63\u88c5\u7f6e\u306e\u50cd\u304d\u3068\u6cbb\u7642\u7d4c\u904e\u306e\u8aac\u660e\u30dd\u30a4\u30f3\u30c8\u3092\u5b66\u3073\u307e\u3059\u3002",
			Category: "ORTHODONTICS", Procedure: "\u77ef\u6b63", SkillLevel: "BEGINNER", DurationSec: 540,
			YouTubeID: "eTSZGIic8cE", InstructorID: "inst-1", Featured: true,
		},
		{
			ID: "v-10", Title: "\u53e3\u8154\u653e\u5c04\u7dda\u753b\u50cf - \u8aad\u5f71\u306e\u57fa\u672c",
			Description: "\u30d1\u30ce\u30e9\u30de\u30fb\u30c7\u30f3\u30bf\u30eb\u30d5\u30a3\u30eb\u30e0\u306e\u898b\u65b9\u3068\u7570\u5e38\u6240\u898b\u306e\u8aad\u307f\u53d6\u308a\u65b9\u3002",
			Category: "RADIOLOGY", Procedure: "\u753b\u50cf\u8a3a\u65ad", SkillLevel: "BEGINNER", DurationSec: 600,
			YouTubeID: "Xfx8D4v5L70", InstructorID: "inst-1", Featured: true,
		},
	}
}

// LearningPaths は起動時に upsert するデモ学習パス定義。
func LearningPaths() []struct {
	ID, Title, Description, Category, SkillLevel, Certificate string
	VideoIDs                                                   []string
	EstimatedMinutes, EnrolledCount                            int
} {
	return []struct {
		ID, Title, Description, Category, SkillLevel, Certificate string
		VideoIDs                                                   []string
		EstimatedMinutes, EnrolledCount                            int
	}{
		{
			ID: "path-1", Title: "\u6839\u7ba1\u6cbb\u7642 \u57fa\u790e\u30b3\u30fc\u30b9", Description: "\u958b\u7a9e\u304b\u3089\u9577\u6e2c\u5b9a\u307e\u3067\u3001\u521d\u3081\u3066\u6839\u7ba1\u6cbb\u7642\u306b\u53d6\u308a\u7d44\u3080\u65b9\u306e\u305f\u3081\u306e\u30ab\u30ea\u30ad\u30e5\u30e9\u30e0\u3002",
			Category: "ENDODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-1", "v-2"},
			EstimatedMinutes: 25, EnrolledCount: 128, Certificate: "\u6839\u7ba1\u6cbb\u7642 \u57fa\u790e\u4fee\u4e86",
		},
		{
			ID: "path-2", Title: "\u6b6f\u5468\u6cbb\u7642\u30b9\u30bf\u30fc\u30bf\u30fc", Description: "SRP\u3068\u60a3\u8005\u6307\u5c0e\u306e\u5b9f\u8df5\u30b9\u30ad\u30eb\u3092\u6bb5\u968e\u7684\u306b\u7fd2\u5f97\u3002",
			Category: "PERIODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-3", "v-6"},
			EstimatedMinutes: 18, EnrolledCount: 256, Certificate: "\u6b6f\u5468\u6cbb\u7642\u30b9\u30bf\u30fc\u30bf\u30fc\u4fee\u4e86",
		},
		{
			ID: "path-3", Title: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u5916\u79d1 \u5165\u9580", Description: "\u57cb\u5165\u306e\u57fa\u790e\u304b\u3089\u5916\u79d1\u7684\u30a2\u30d7\u30ed\u30fc\u30c1\u307e\u3067\u3002",
			Category: "IMPLANT", SkillLevel: "ADVANCED", VideoIDs: []string{"v-4", "v-5"},
			EstimatedMinutes: 25, EnrolledCount: 64, Certificate: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u5916\u79d1 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-4", Title: "\u77ef\u6b63\u6cbb\u7642 \u5165\u9580", Description: "\u77ef\u6b63\u6cbb\u7642\u306e\u6d41\u308c\u3068\u60a3\u8005\u8aac\u660e\u306e\u57fa\u790e\u3002",
			Category: "ORTHODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-9"},
			EstimatedMinutes: 10, EnrolledCount: 48, Certificate: "\u77ef\u6b63\u6cbb\u7642 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-5", Title: "\u5c0f\u5150\u6b6f\u79d1 \u5165\u9580", Description: "\u521d\u8a3a\u5bfe\u5fdc\u3068\u884c\u52d5\u7ba1\u7406\u306e\u5b9f\u8df5\u30b9\u30ad\u30eb\u3002",
			Category: "PEDIATRIC", SkillLevel: "BEGINNER", VideoIDs: []string{"v-7"},
			EstimatedMinutes: 8, EnrolledCount: 72, Certificate: "\u5c0f\u5150\u6b6f\u79d1 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-6", Title: "\u753b\u50cf\u8a3a\u65ad \u5165\u9580", Description: "\u53e3\u8154\u653e\u5c04\u7dda\u753b\u50cf\u306e\u8aad\u5f71\u306e\u57fa\u672c\u3002",
			Category: "RADIOLOGY", SkillLevel: "BEGINNER", VideoIDs: []string{"v-10"},
			EstimatedMinutes: 10, EnrolledCount: 56, Certificate: "\u753b\u50cf\u8a3a\u65ad \u5165\u9580\u4fee\u4e86",
		},
	}
}

// CategoryPaths is an alias kept for callers that only need category demo paths.
func CategoryPaths() []struct {
	ID, Title, Description, Category, SkillLevel, Certificate string
	VideoIDs                                                   []string
	EstimatedMinutes, EnrolledCount                            int
} {
	return LearningPaths()
}
