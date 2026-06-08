// Package store は DATABASE_URL 未設定時のインメモリ実装（ローカル開発・デモ用）。
package store

import (
	"math"
	"strings"
	"sync"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
)

const demoLearnerID = "learner-demo"

// Store は組織横断のデモデータをプロセス内に保持する（本番は postgres パッケージ）。
type Store struct {
	mu           sync.RWMutex
	instructors  []models.Instructor
	videos       []models.Video
	paths        []models.LearningPath
	quizzes      []models.Quiz
	progress     []models.WatchProgress
	notes        []models.VideoNote
	bookmarks    []models.Bookmark
	attempts     []models.QuizAttempt
	certificates []models.Certificate
	enrollments  map[string]map[string]bool // learnerId -> pathId
}

// New は歯科教育向けサンプルカタログをシードした Store を返す。
func New() *Store {
	s := &Store{enrollments: map[string]map[string]bool{}}
	s.seed()
	return s
}

func (s *Store) Dashboard() models.DashboardStats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	completions := 0
	watchSec := 0
	learners := map[string]bool{}
	for _, p := range s.progress {
		learners[p.LearnerID] = true
		watchSec += p.PositionSec
		if p.Completed {
			completions++
		}
	}

	return models.DashboardStats{
		VideosTotal:          len(s.videos),
		LearningPathsTotal:   len(s.paths),
		QuizzesTotal:         len(s.quizzes),
		CompletionsThisMonth: completions,
		WatchHoursThisMonth:  float64(watchSec) / 3600,
		ActiveLearners:       len(learners),
	}
}

func (s *Store) ListInstructors() []models.Instructor {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Instructor, len(s.instructors))
	copy(out, s.instructors)
	return out
}

func (s *Store) GetInstructor(id string) (models.Instructor, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, i := range s.instructors {
		if i.ID == id {
			return i, true
		}
	}
	return models.Instructor{}, false
}

func (s *Store) InstructorName(id string) string {
	if i, ok := s.GetInstructor(id); ok {
		return i.Name
	}
	return ""
}

func (s *Store) PaginateVideos(category, skillLevel, search string, page, pageSize int) models.VideoPage {
	s.mu.RLock()
	defer s.mu.RUnlock()

	filtered := make([]models.Video, 0, len(s.videos))
	search = strings.ToLower(strings.TrimSpace(search))
	for _, v := range s.videos {
		if category != "" && v.Category != category {
			continue
		}
		if skillLevel != "" && v.SkillLevel != skillLevel {
			continue
		}
		if search != "" {
			hay := strings.ToLower(v.Title + " " + v.Description + " " + v.Procedure + " " + strings.Join(v.Tags, " "))
			if !strings.Contains(hay, search) {
				continue
			}
		}
		filtered = append(filtered, v)
	}
	return paginateVideos(filtered, page, pageSize)
}

func paginateVideos(items []models.Video, page, pageSize int) models.VideoPage {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 12
	}
	total := len(items)
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}
	start := (page - 1) * pageSize
	if start > total {
		start = total
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	slice := items[start:end]
	if slice == nil {
		slice = []models.Video{}
	}
	return models.VideoPage{
		Items: slice,
		PageInfo: models.PageInfo{
			Total: total, Page: page, PageSize: pageSize, TotalPages: totalPages,
		},
	}
}

func (s *Store) GetVideo(id string) (models.Video, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, v := range s.videos {
		if v.ID == id {
			return v, true
		}
	}
	return models.Video{}, false
}

func (s *Store) IncrementVideoViewCount(id string) (models.Video, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.videos {
		if s.videos[i].ID == id {
			s.videos[i].ViewCount++
			return s.videos[i], true
		}
	}
	return models.Video{}, false
}

func (s *Store) FeaturedVideos() []models.Video {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.Video{}
	for _, v := range s.videos {
		if v.Featured {
			out = append(out, v)
		}
	}
	return out
}

func (s *Store) ListPaths(category, skillLevel string) []models.LearningPath {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.LearningPath{}
	for _, p := range s.paths {
		if category != "" && p.Category != category {
			continue
		}
		if skillLevel != "" && p.SkillLevel != skillLevel {
			continue
		}
		out = append(out, p)
	}
	return out
}

func (s *Store) GetPath(id string) (models.LearningPath, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, p := range s.paths {
		if p.ID == id {
			return p, true
		}
	}
	return models.LearningPath{}, false
}

func (s *Store) ListProgress(learnerID string) []models.WatchProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.WatchProgress{}
	for _, p := range s.progress {
		if p.LearnerID == learnerID {
			out = append(out, p)
		}
	}
	return out
}

func (s *Store) ListBookmarks(learnerID string) []models.Bookmark {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.Bookmark{}
	for _, b := range s.bookmarks {
		if b.LearnerID == learnerID {
			out = append(out, b)
		}
	}
	return out
}

func (s *Store) ListNotes(videoID, learnerID string) []models.VideoNote {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.VideoNote{}
	for _, n := range s.notes {
		if n.VideoID == videoID && n.LearnerID == learnerID {
			out = append(out, n)
		}
	}
	return out
}

func (s *Store) ListQuizzes(videoID string) []models.Quiz {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.Quiz{}
	for _, q := range s.quizzes {
		if videoID == "" || q.VideoID == videoID {
			out = append(out, q)
		}
	}
	return out
}

func (s *Store) GetQuiz(id string) (models.Quiz, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, q := range s.quizzes {
		if q.ID == id {
			return q, true
		}
	}
	return models.Quiz{}, false
}

func (s *Store) ListAttempts(learnerID string) []models.QuizAttempt {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.QuizAttempt{}
	for _, a := range s.attempts {
		if a.LearnerID == learnerID {
			out = append(out, a)
		}
	}
	return out
}

func (s *Store) ListCertificates(learnerID string) []models.Certificate {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []models.Certificate{}
	for _, c := range s.certificates {
		if c.LearnerID == learnerID {
			out = append(out, c)
		}
	}
	return out
}

func (s *Store) UpdateProgress(p models.WatchProgress) models.WatchProgress {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, existing := range s.progress {
		if existing.VideoID == p.VideoID && existing.LearnerID == p.LearnerID {
			p.ID = existing.ID
			p.UpdatedAt = time.Now()
			s.progress[i] = p
			return p
		}
	}
	if p.ID == "" {
		p.ID = newID("wp")
	}
	p.UpdatedAt = time.Now()
	s.progress = append(s.progress, p)
	return p
}

func (s *Store) CreateNote(n models.VideoNote) models.VideoNote {
	s.mu.Lock()
	defer s.mu.Unlock()
	if n.ID == "" {
		n.ID = newID("note")
	}
	n.CreatedAt = time.Now()
	s.notes = append(s.notes, n)
	return n
}

func (s *Store) DeleteNote(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, n := range s.notes {
		if n.ID == id {
			s.notes = append(s.notes[:i], s.notes[i+1:]...)
			return true
		}
	}
	return false
}

func (s *Store) ToggleBookmark(videoID, learnerID string) (*models.Bookmark, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, b := range s.bookmarks {
		if b.VideoID == videoID && b.LearnerID == learnerID {
			s.bookmarks = append(s.bookmarks[:i], s.bookmarks[i+1:]...)
			return nil, true
		}
	}
	b := models.Bookmark{
		ID: newID("bm"), VideoID: videoID, LearnerID: learnerID, CreatedAt: time.Now(),
	}
	s.bookmarks = append(s.bookmarks, b)
	return &b, true
}

func (s *Store) EnrollPath(pathID, learnerID string) (models.LearningPath, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.enrollments[learnerID] == nil {
		s.enrollments[learnerID] = map[string]bool{}
	}
	if !s.enrollments[learnerID][pathID] {
		s.enrollments[learnerID][pathID] = true
		for i, p := range s.paths {
			if p.ID == pathID {
				s.paths[i].EnrolledCount++
				return s.paths[i], true
			}
		}
	}
	for _, p := range s.paths {
		if p.ID == pathID {
			return p, true
		}
	}
	return models.LearningPath{}, false
}

func (s *Store) SubmitQuizAttempt(quizID, learnerID string, answers []int) (models.QuizAttempt, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var quiz models.Quiz
	for _, q := range s.quizzes {
		if q.ID == quizID {
			quiz = q
			break
		}
	}
	if quiz.ID == "" {
		return models.QuizAttempt{}, false
	}
	correct := 0
	for i, qn := range quiz.Questions {
		if i < len(answers) && answers[i] == qn.CorrectIndex {
			correct++
		}
	}
	score := 0
	if len(quiz.Questions) > 0 {
		score = int(float64(correct) / float64(len(quiz.Questions)) * 100)
	}
	passed := score >= quiz.PassingScore
	attempt := models.QuizAttempt{
		ID: newID("qa"), QuizID: quizID, LearnerID: learnerID,
		Score: score, Passed: passed, CompletedAt: time.Now(),
	}
	s.attempts = append(s.attempts, attempt)

	if passed && quiz.VideoID != "" {
		s.maybeIssuePathCertificate(learnerID, quiz.VideoID)
	}
	return attempt, true
}

// maybeIssuePathCertificate はパス内全動画完了時に修了証を自動発行する。
func (s *Store) maybeIssuePathCertificate(learnerID, videoID string) {
	for _, path := range s.paths {
		allDone := len(path.VideoIDs) > 0
		for _, vid := range path.VideoIDs {
			done := false
			for _, p := range s.progress {
				if p.LearnerID == learnerID && p.VideoID == vid && p.Completed {
					done = true
					break
				}
			}
			if vid == videoID {
				done = true
			}
			if !done {
				allDone = false
				break
			}
		}
		if !allDone {
			continue
		}
		for _, c := range s.certificates {
			if c.PathID == path.ID && c.LearnerID == learnerID {
				return
			}
		}
		s.certificates = append(s.certificates, models.Certificate{
			ID: newID("cert"), PathID: path.ID, LearnerID: learnerID,
			Title: path.CertificateTitle, IssuedAt: time.Now(),
		})
	}
}

func newID(prefix string) string {
	return prefix + "-" + time.Now().Format("150405") + "-" + randomSuffix()
}

func randomSuffix() string {
	return time.Now().Format("000000000")
}
