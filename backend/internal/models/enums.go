// GraphQL と DB で共有する列挙型。
package models

type SkillLevel string

const (
	SkillLevelBeginner     SkillLevel = "BEGINNER"
	SkillLevelIntermediate SkillLevel = "INTERMEDIATE"
	SkillLevelAdvanced     SkillLevel = "ADVANCED"
)

func (e SkillLevel) IsValid() bool {
	switch e {
	case SkillLevelBeginner, SkillLevelIntermediate, SkillLevelAdvanced:
		return true
	default:
		return false
	}
}

func (e SkillLevel) String() string { return string(e) }

type VideoCategory string

const (
	VideoCategoryEndodontics        VideoCategory = "ENDODONTICS"
	VideoCategoryPeriodontics       VideoCategory = "PERIODONTICS"
	VideoCategoryProsthodontics     VideoCategory = "PROSTHODONTICS"
	VideoCategoryOralSurgery        VideoCategory = "ORAL_SURGERY"
	VideoCategoryImplant            VideoCategory = "IMPLANT"
	VideoCategoryOrthodontics       VideoCategory = "ORTHODONTICS"
	VideoCategoryPediatric          VideoCategory = "PEDIATRIC"
	VideoCategoryRadiology          VideoCategory = "RADIOLOGY"
	VideoCategoryInfectionControl   VideoCategory = "INFECTION_CONTROL"
	VideoCategoryCommunication      VideoCategory = "COMMUNICATION"
)

func (e VideoCategory) IsValid() bool {
	switch e {
	case VideoCategoryEndodontics, VideoCategoryPeriodontics, VideoCategoryProsthodontics,
		VideoCategoryOralSurgery, VideoCategoryImplant, VideoCategoryOrthodontics,
		VideoCategoryPediatric, VideoCategoryRadiology, VideoCategoryInfectionControl,
		VideoCategoryCommunication:
		return true
	default:
		return false
	}
}

func (e VideoCategory) String() string { return string(e) }

type LearningActivityKind string

const (
	ActivityProgressUpdated  LearningActivityKind = "PROGRESS_UPDATED"
	ActivityNoteCreated      LearningActivityKind = "NOTE_CREATED"
	ActivityBookmarkToggled  LearningActivityKind = "BOOKMARK_TOGGLED"
	ActivityPathEnrolled     LearningActivityKind = "PATH_ENROLLED"
	ActivityQuizSubmitted    LearningActivityKind = "QUIZ_SUBMITTED"
)

func (e LearningActivityKind) String() string { return string(e) }

type LearningActivityEvent struct {
	Kind       LearningActivityKind
	LearnerID  string
	VideoID    *string
	PathID     *string
	QuizID     *string
	Message    string
	OccurredAt string
}
