package store

// インメモリストア向けの日本語デモカタログ（postgres/seed と内容を揃える）

import (
	"time"

	"github.com/pluszero/dental-video-api/internal/demo"
	"github.com/pluszero/dental-video-api/internal/models"
)

// seed は講師・動画・学習パス・クイズ等の初期データを投入する。
func (s *Store) seed() {
	now := time.Now()
	s.instructors = []models.Instructor{
		{ID: "inst-1", Name: "\u7530\u4e2d \u5065\u4e00", Title: "\u6b6f\u79d1\u533b\u5e2b", Specialty: "\u6b6f\u5185\u7642\u6cd5", Bio: "\u5927\u5b66\u75c5\u9662\u6b6f\u5185\u79d1\u3067\u306e\u6307\u5c0e\u7d4c\u9a1315\u5e74\u3002", AvatarURL: "/avatars/inst-1.svg", VideoCount: 4},
		{ID: "inst-2", Name: "\u4f50\u85e4 \u7f8e\u54b2", Title: "\u6b6f\u79d1\u885b\u751f\u58eb", Specialty: "\u6b6f\u5468\u6cbb\u7642", Bio: "SRP\u30fb\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u6307\u5c0e\u306e\u30b9\u30da\u30b7\u30e3\u30ea\u30b9\u30c8\u3002", AvatarURL: "/avatars/inst-2.svg", VideoCount: 3},
		{ID: "inst-3", Name: "\u9234\u6728 \u5927\u8f14", Title: "\u6b6f\u79d1\u533b\u5e2b", Specialty: "\u53e3\u8154\u5916\u79d1\u30fb\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", Bio: "\u629c\u6b6f\u30fb\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u624b\u8853\u306e\u6559\u80b2\u30b3\u30f3\u30c6\u30f3\u30c4\u3092\u76e3\u4fee\u3002", AvatarURL: "/avatars/inst-3.svg", VideoCount: 3},
	}

	s.videos = []models.Video{
		{
			ID: "v-1", Title: "\u6839\u7ba1\u6cbb\u7642 Step1 - \u958b\u7a9e\u3068\u30a2\u30af\u30bb\u30b9", Description: "\u9069\u5207\u306a\u30a2\u30af\u30bb\u30b9\u7a9e\u5f62\u6210\u3068\u6839\u7ba1\u5165\u53e3\u306e\u78ba\u8a8d\u624b\u6280\u3092\u89e3\u8aac\u3057\u307e\u3059\u3002",
			Category: "ENDODONTICS", Procedure: "\u6839\u7ba1\u6cbb\u7642", SkillLevel: "BEGINNER", DurationSec: 720,
			ThumbnailURL: "https://placehold.co/640x360/0d9488/fff?text=Endo+Access",
			VideoURL: demo.VideoURL("v-1"), InstructorID: "inst-1",
			Tags: []string{"\u6839\u7ba1", "\u30a2\u30af\u30bb\u30b9", "\u30de\u30a4\u30af\u30ed"}, ViewCount: 1240, PublishedAt: now.AddDate(0, -2, 0), Featured: true,
		},
		{
			ID: "v-2", Title: "\u30ef\u30fc\u30af\u9577\u6e2c\u5b9a\u3068\u96fb\u6c17\u9577\u6e2c\u5b9a\u5668\u306e\u4f7f\u3044\u65b9", Description: "APEX\u30ed\u30b1\u30fc\u30bf\u306e\u8aad\u307f\u53d6\u308a\u3068\u81e8\u5e8a\u5224\u65ad\u306e\u30dd\u30a4\u30f3\u30c8\u3002",
			Category: "ENDODONTICS", Procedure: "\u6839\u7ba1\u6cbb\u7642", SkillLevel: "INTERMEDIATE", DurationSec: 540,
			ThumbnailURL: "https://placehold.co/640x360/0891b2/fff?text=Working+Length",
			VideoURL: demo.VideoURL("v-2"), InstructorID: "inst-1",
			Tags: []string{"WL", "APEX"}, ViewCount: 890, PublishedAt: now.AddDate(0, -1, -10), Featured: true,
		},
		{
			ID: "v-3", Title: "SRP \u57fa\u672c\u624b\u6280 - \u30b9\u30b1\u30fc\u30e9\u30fc\u306e\u89d2\u5ea6\u3068\u30b9\u30c8\u30ed\u30fc\u30af", Description: "\u6b6f\u77f3\u9664\u53bb\u306e\u57fa\u672c\u52d5\u4f5c\u3068\u60a3\u8005\u3078\u306e\u8aac\u660e\u306e\u30b3\u30c4\u3002",
			Category: "PERIODONTICS", Procedure: "SRP", SkillLevel: "BEGINNER", DurationSec: 600,
			ThumbnailURL: "https://placehold.co/640x360/059669/fff?text=SRP+Basics",
			VideoURL: demo.VideoURL("v-3"), InstructorID: "inst-2",
			Tags: []string{"SRP", "\u6b6f\u5468"}, ViewCount: 2100, PublishedAt: now.AddDate(0, -3, 0), Featured: true,
		},
		{
			ID: "v-4", Title: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u57cb\u5165 - \u30d5\u30e9\u30c3\u30d7\u30c7\u30b6\u30a4\u30f3\u3068\u6cbb\u7642\u306e\u6d41\u308c", Description: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u6cbb\u7642\u306e\u5168\u4f53\u50cf\u3068\u57cb\u5165\u90e8\u4f4d\u306e\u6e96\u5099\u624b\u9806\u3092\u89e3\u8aac\u3057\u307e\u3059\u3002",
			Category: "IMPLANT", Procedure: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", SkillLevel: "ADVANCED", DurationSec: 900,
			ThumbnailURL: "https://img.youtube.com/vi/g-i3P-D6p7M/hqdefault.jpg",
			VideoURL: demo.VideoURL("v-4"), InstructorID: "inst-3",
			Tags: []string{"\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", "\u5916\u79d1"}, ViewCount: 560, PublishedAt: now.AddDate(0, -1, 0), Featured: true,
		},
		{
			ID: "v-5", Title: "\u5358\u72ec\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8 - \u6cbb\u7642\u8a08\u753b\u3068\u57cb\u5165\u306e\u8981\u70b9", Description: "\u5358\u72ec\u6b6f\u6b20\u640d\u3078\u306e\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u6cbb\u7642\u306e\u6d41\u308c\u3068\u5be9\u7f8e\u30fb\u6a5f\u80fd\u306e\u8003\u3048\u65b9\u3002",
			Category: "IMPLANT", Procedure: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", SkillLevel: "INTERMEDIATE", DurationSec: 660,
			ThumbnailURL: "https://img.youtube.com/vi/8gVfdyASewA/hqdefault.jpg",
			VideoURL: demo.VideoURL("v-5"), InstructorID: "inst-3",
			Tags: []string{"\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8", "\u6cbb\u7642\u8a08\u753b"}, ViewCount: 780, PublishedAt: now.AddDate(0, -2, -5), Featured: false,
		},
		{
			ID: "v-6", Title: "\u611f\u67d3\u5bfe\u7b56 - \u6ec1\u83cc\u30b5\u30a4\u30af\u30eb\u3068\u30c8\u30ec\u30fc\u30b5\u30d3\u30ea\u30c6\u30a3", Description: "\u30af\u30e9\u30b9B\u30aa\u30fc\u30c8\u30af\u30ec\u30fc\u30d6\u904b\u7528\u306e\u6a19\u6e96\u624b\u9806\u3002",
			Category: "INFECTION_CONTROL", Procedure: "\u6ec1\u83cc", SkillLevel: "BEGINNER", DurationSec: 480,
			ThumbnailURL: "https://placehold.co/640x360/475569/fff?text=Sterilization",
			VideoURL: demo.VideoURL("v-6"), InstructorID: "inst-2",
			Tags: []string{"\u611f\u67d3\u5bfe\u7b56", "\u6ec1\u83cc"}, ViewCount: 3200, PublishedAt: now.AddDate(0, -4, 0), Featured: true,
		},
		{
			ID: "v-7", Title: "\u5c0f\u5150\u6b6f\u79d1 - \u521d\u8a3a\u306e\u6d41\u308c\u3068\u884c\u52d5\u7ba1\u7406\u306e\u57fa\u672c", Description: "\u4f4e\u4fb5\u8972\u3067\u8a3a\u7642\u3092\u9032\u3081\u308b\u305f\u3081\u306e\u58f0\u304b\u3051\u30fb\u30dd\u30b8\u30b7\u30e7\u30cb\u30f3\u30b0\u30fb\u4fdd\u8b77\u8005\u8aac\u660e\u306e\u8981\u70b9\u3002",
			Category: "PEDIATRIC", Procedure: "\u884c\u52d5\u7ba1\u7406", SkillLevel: "BEGINNER", DurationSec: 420,
			ThumbnailURL: "https://img.youtube.com/vi/GGJRR5RsalU/hqdefault.jpg",
			VideoURL: demo.VideoURL("v-7"), InstructorID: "inst-2",
			Tags: []string{"\u5c0f\u5150", "\u521d\u8a3a", "\u884c\u52d5\u7ba1\u7406"}, ViewCount: 1450, PublishedAt: now.AddDate(0, -1, -20), Featured: true,
		},
		{
			ID: "v-8", Title: "\u629c\u6b6f - \u96e3\u629c\u6b6f\u306e\u5206\u5272\u3068\u30a8\u30ec\u30d9\u30fc\u30b7\u30e7\u30f3", Description: "\u30eb\u30fc\u30c8\u7834\u6298\u30ea\u30b9\u30af\u3092\u4e0b\u3052\u308b\u5206\u5272\u629c\u6b6f\u306e\u624b\u9806\u3002",
			Category: "ORAL_SURGERY", Procedure: "\u629c\u6b6f", SkillLevel: "ADVANCED", DurationSec: 840,
			ThumbnailURL: "https://placehold.co/640x360/b91c1c/fff?text=Extraction",
			VideoURL: demo.VideoURL("v-8"), InstructorID: "inst-3",
			Tags: []string{"\u5916\u79d1", "\u629c\u6b6f"}, ViewCount: 990, PublishedAt: now.AddDate(0, 0, -15), Featured: false,
		},
		{
			ID: "v-9", Title: "\u77ef\u6b63\u6cbb\u7642\u306e\u57fa\u790e - \u30d6\u30e9\u30b1\u30c3\u30c8\u306e\u4ed5\u7d44\u307f\u3068\u6cbb\u7642\u306e\u6d41\u308c", Description: "\u77ef\u6b63\u88c5\u7f6e\u306e\u50cd\u304d\u3068\u6cbb\u7642\u7d4c\u904e\u306e\u8aac\u660e\u30dd\u30a4\u30f3\u30c8\u3092\u5b66\u3073\u307e\u3059\u3002",
			Category: "ORTHODONTICS", Procedure: "\u77ef\u6b63", SkillLevel: "BEGINNER", DurationSec: 540,
			ThumbnailURL: "https://img.youtube.com/vi/eTSZGIic8cE/hqdefault.jpg",
			VideoURL: demo.VideoURL("v-9"), InstructorID: "inst-1",
			Tags: []string{"\u77ef\u6b63", "\u30d6\u30e9\u30b1\u30c3\u30c8"}, ViewCount: 820, PublishedAt: now.AddDate(0, 0, -10), Featured: true,
		},
		{
			ID: "v-10", Title: "\u53e3\u8154\u653e\u5c04\u7dda\u753b\u50cf - \u8aad\u5f71\u306e\u57fa\u672c", Description: "\u30d1\u30ce\u30e9\u30de\u30fb\u30c7\u30f3\u30bf\u30eb\u30d5\u30a3\u30eb\u30e0\u306e\u898b\u65b9\u3068\u7570\u5e38\u6240\u898b\u306e\u8aad\u307f\u53d6\u308a\u65b9\u3002",
			Category: "RADIOLOGY", Procedure: "\u753b\u50cf\u8a3a\u65ad", SkillLevel: "BEGINNER", DurationSec: 600,
			ThumbnailURL: "https://img.youtube.com/vi/Xfx8D4v5L70/hqdefault.jpg",
			VideoURL: demo.VideoURL("v-10"), InstructorID: "inst-1",
			Tags: []string{"\u653e\u5c04\u7dda", "\u8aad\u5f71", "\u30d1\u30ce\u30e9\u30de"}, ViewCount: 640, PublishedAt: now.AddDate(0, 0, -8), Featured: true,
		},
	}

	s.paths = []models.LearningPath{
		{
			ID: "path-1", Title: "\u6839\u7ba1\u6cbb\u7642 \u57fa\u790e\u30b3\u30fc\u30b9", Description: "\u958b\u7a9e\u304b\u3089\u9577\u6e2c\u5b9a\u307e\u3067\u3001\u521d\u3081\u3066\u6839\u7ba1\u6cbb\u7642\u306b\u53d6\u308a\u7d44\u3080\u65b9\u306e\u305f\u3081\u306e\u30ab\u30ea\u30ad\u30e5\u30e9\u30e0\u3002",
			Category: "ENDODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-1", "v-2"},
			EstimatedMinutes: 25, EnrolledCount: 128, CertificateTitle: "\u6839\u7ba1\u6cbb\u7642 \u57fa\u790e\u4fee\u4e86",
		},
		{
			ID: "path-2", Title: "\u6b6f\u5468\u6cbb\u7642\u30b9\u30bf\u30fc\u30bf\u30fc", Description: "SRP\u3068\u60a3\u8005\u6307\u5c0e\u306e\u5b9f\u8df5\u30b9\u30ad\u30eb\u3092\u6bb5\u968e\u7684\u306b\u7fd2\u5f97\u3002",
			Category: "PERIODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-3", "v-6"},
			EstimatedMinutes: 18, EnrolledCount: 256, CertificateTitle: "\u6b6f\u5468\u6cbb\u7642\u30b9\u30bf\u30fc\u30bf\u30fc\u4fee\u4e86",
		},
		{
			ID: "path-3", Title: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u5916\u79d1 \u5165\u9580", Description: "\u57cb\u5165\u306e\u57fa\u790e\u304b\u3089\u5916\u79d1\u7684\u30a2\u30d7\u30ed\u30fc\u30c1\u307e\u3067\u3002",
			Category: "IMPLANT", SkillLevel: "ADVANCED", VideoIDs: []string{"v-4", "v-5"},
			EstimatedMinutes: 25, EnrolledCount: 64, CertificateTitle: "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8\u5916\u79d1 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-4", Title: "\u77ef\u6b63\u6cbb\u7642 \u5165\u9580", Description: "\u77ef\u6b63\u6cbb\u7642\u306e\u6d41\u308c\u3068\u60a3\u8005\u8aac\u660e\u306e\u57fa\u790e\u3002",
			Category: "ORTHODONTICS", SkillLevel: "BEGINNER", VideoIDs: []string{"v-9"},
			EstimatedMinutes: 10, EnrolledCount: 48, CertificateTitle: "\u77ef\u6b63\u6cbb\u7642 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-5", Title: "\u5c0f\u5150\u6b6f\u79d1 \u5165\u9580", Description: "\u521d\u8a3a\u5bfe\u5fdc\u3068\u884c\u52d5\u7ba1\u7406\u306e\u5b9f\u8df5\u30b9\u30ad\u30eb\u3002",
			Category: "PEDIATRIC", SkillLevel: "BEGINNER", VideoIDs: []string{"v-7"},
			EstimatedMinutes: 8, EnrolledCount: 72, CertificateTitle: "\u5c0f\u5150\u6b6f\u79d1 \u5165\u9580\u4fee\u4e86",
		},
		{
			ID: "path-6", Title: "\u753b\u50cf\u8a3a\u65ad \u5165\u9580", Description: "\u53e3\u8154\u653e\u5c04\u7dda\u753b\u50cf\u306e\u8aad\u5f71\u306e\u57fa\u672c\u3002",
			Category: "RADIOLOGY", SkillLevel: "BEGINNER", VideoIDs: []string{"v-10"},
			EstimatedMinutes: 10, EnrolledCount: 56, CertificateTitle: "\u753b\u50cf\u8a3a\u65ad \u5165\u9580\u4fee\u4e86",
		},
	}

	s.quizzes = []models.Quiz{
		{
			ID: "quiz-1", VideoID: "v-1", Title: "\u6839\u7ba1\u30a2\u30af\u30bb\u30b9 \u7406\u89e3\u5ea6\u30c1\u30a7\u30c3\u30af", PassingScore: 70,
			Questions: []models.QuizQuestion{
				{
					ID: "q1-1", Prompt: "\u30a2\u30af\u30bb\u30b9\u7a9e\u5f62\u6210\u3067\u6700\u3082\u91cd\u8981\u306a\u306e\u306f\uff1f",
					Choices: []models.QuizChoice{
						{ID: "c1", Label: "\u5be9\u7f8e\u6027\u306e\u307f\u3092\u512a\u5148\u3059\u308b"},
						{ID: "c2", Label: "\u6839\u7ba1\u5165\u53e3\u3092\u76f4\u8996\u30fb\u5668\u5177\u3067\u5230\u9054\u3067\u304d\u308b\u3053\u3068"},
						{ID: "c3", Label: "\u6b6f\u8089\u3092\u6700\u5927\u9650\u5207\u9664\u3059\u308b"},
					},
					CorrectIndex: 1,
				},
				{
					ID: "q1-2", Prompt: "\u30de\u30a4\u30af\u30ed\u30b9\u30b3\u30fc\u30d7\u306e\u4e3b\u306a\u5229\u70b9\u306f\uff1f",
					Choices: []models.QuizChoice{
						{ID: "c4", Label: "\u6cbb\u7642\u6642\u9593\u306e\u77ed\u7e2e\u306e\u307f"},
						{ID: "c5", Label: "\u8996\u91ce\u306e\u62e1\u5927\u3068\u7cbe\u5bc6\u64cd\u4f5c"},
						{ID: "c6", Label: "\u9ebb\u9187\u91cf\u306e\u5897\u52a0"},
					},
					CorrectIndex: 1,
				},
			},
		},
		{
			ID: "quiz-2", VideoID: "v-3", Title: "SRP \u624b\u6280\u30af\u30a4\u30ba", PassingScore: 80,
			Questions: []models.QuizQuestion{
				{
					ID: "q2-1", Prompt: "\u30b9\u30b1\u30fc\u30e9\u30fc\u306e\u9069\u5207\u306a\u89d2\u5ea6\u306f\uff1f",
					Choices: []models.QuizChoice{
						{ID: "c7", Label: "\u6b6f\u9762\u306b\u5e73\u884c"},
						{ID: "c8", Label: "\u6b6f\u9762\u306b\u5bfe\u3057\u7d0480\u5ea6"},
						{ID: "c9", Label: "\u5782\u76f4\u306e\u307f"},
					},
					CorrectIndex: 1,
				},
			},
		},
		{
			ID: "quiz-3", VideoID: "", Title: "\u611f\u67d3\u5bfe\u7b56 \u7dcf\u5408\u30c6\u30b9\u30c8", PassingScore: 75,
			Questions: []models.QuizQuestion{
				{
					ID: "q3-1", Prompt: "\u30af\u30e9\u30b9B\u30aa\u30fc\u30c8\u30af\u30ec\u30fc\u30d6\u5f8c\u306e\u78ba\u8a8d\u3067\u5fc5\u9808\u306a\u306e\u306f\uff1f",
					Choices: []models.QuizChoice{
						{ID: "c10", Label: "\u30a4\u30f3\u30b8\u30b1\u30fc\u30bf\u30fc\u306e\u5909\u8272\u78ba\u8a8d"},
						{ID: "c11", Label: "\u8272\u306e\u597d\u307f"},
						{ID: "c12", Label: "\u60a3\u8005\u306e\u5e74\u9f62"},
					},
					CorrectIndex: 0,
				},
			},
		},
	}

	s.progress = []models.WatchProgress{
		{ID: "wp-1", VideoID: "v-1", LearnerID: demoLearnerID, PositionSec: 600, Completed: false, UpdatedAt: now},
		{ID: "wp-2", VideoID: "v-3", LearnerID: demoLearnerID, PositionSec: 600, Completed: true, UpdatedAt: now},
		{ID: "wp-3", VideoID: "v-6", LearnerID: demoLearnerID, PositionSec: 480, Completed: true, UpdatedAt: now},
	}

	s.notes = []models.VideoNote{
		{ID: "note-1", VideoID: "v-1", LearnerID: demoLearnerID, TimestampSec: 120, Body: "\u30a2\u30af\u30bb\u30b9\u89d2\u5ea6\u3092\u30e1\u30e2", CreatedAt: now},
	}

	s.bookmarks = []models.Bookmark{
		{ID: "bm-1", VideoID: "v-4", LearnerID: demoLearnerID, CreatedAt: now},
	}

	s.attempts = []models.QuizAttempt{
		{ID: "qa-1", QuizID: "quiz-2", LearnerID: demoLearnerID, Score: 100, Passed: true, CompletedAt: now.AddDate(0, 0, -3)},
	}

	s.certificates = []models.Certificate{
		{ID: "cert-1", PathID: "path-2", LearnerID: demoLearnerID, Title: "\u6b6f\u5468\u6cbb\u7642\u30b9\u30bf\u30fc\u30bf\u30fc\u4fee\u4e86", IssuedAt: now.AddDate(0, 0, -1)},
	}

	s.enrollments[demoLearnerID] = map[string]bool{"path-1": true, "path-2": true}
}
