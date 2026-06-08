// マルチテナント SaaS（組織・チーム・利用量）の型定義。
package models

import "time"

type MemberRole string

const (
	RoleOwner  MemberRole = "OWNER"
	RoleAdmin  MemberRole = "ADMIN"
	RoleMember MemberRole = "MEMBER"
	RoleViewer MemberRole = "VIEWER"
)

type PlanTier string

const (
	PlanFree       PlanTier = "FREE"
	PlanStarter    PlanTier = "STARTER"
	PlanPro        PlanTier = "PRO"
	PlanEnterprise PlanTier = "ENTERPRISE"
)

type SubscriptionStatus string

const (
	SubActive   SubscriptionStatus = "ACTIVE"
	SubTrialing SubscriptionStatus = "TRIALING"
	SubPastDue  SubscriptionStatus = "PAST_DUE"
	SubCanceled SubscriptionStatus = "CANCELED"
)

type Organization struct {
	ID                 string
	Name               string
	Slug               string
	PlanTier           PlanTier
	SubscriptionStatus SubscriptionStatus
	SeatCount          int
	Timezone           string
	CustomDomain       string
	MemberCount        int
	CreatedAt          time.Time
}

type User struct {
	ID        string
	Email     string
	Name      string
	AvatarURL string
}

type TeamMember struct {
	ID           string
	UserID       string
	OrgID        string
	Role         MemberRole
	JoinedAt     time.Time
	LastActiveAt time.Time
}

type APIKey struct {
	ID         string
	OrgID      string
	Name       string
	Prefix     string
	SecretHash string
	LastUsedAt *time.Time
	CreatedAt  time.Time
	RevokedAt  *time.Time
}

type APIKeyCreated struct {
	Key    APIKey
	Secret string
}

type AuditLogEntry struct {
	ID        string
	OrgID     string
	Action    string
	Resource  string
	ActorName string
	IPAddress string
	Metadata  string
	CreatedAt time.Time
}

type Session struct {
	User         User
	Organization Organization
	Role         MemberRole
}

type UsageSummary struct {
	Members           int
	MembersLimit      int
	Videos            int
	VideosLimit       int
	APICallsThisMonth int
	APICallsLimit     int
	ConsultTokensMonth int
}

type LiveSession struct {
	ID          string
	OrgID       string
	HostUserID  string
	Title       string
	Description string
	ScheduledAt time.Time
	Status      string
	StreamURL   string
	CreatedAt   time.Time
}

type CaseDiscussion struct {
	ID           string
	OrgID        string
	AuthorUserID string
	Title        string
	Summary      string
	Status       string
	PostCount    int
	CreatedAt    time.Time
}

type CasePost struct {
	ID           string
	DiscussionID string
	AuthorUserID string
	AuthorName   string
	Body         string
	CreatedAt    time.Time
}

type ConsultationThread struct {
	ID        string
	OrgID     string
	UserID    string
	Title     string
	CreatedAt time.Time
}

type ConsultationMessage struct {
	ID        string
	ThreadID  string
	Role      string
	Content   string
	CreatedAt time.Time
}

type UploadTarget struct {
	UploadURL string
	ObjectKey string
	PublicURL string
}

type AuthPayload struct {
	Token   string
	Session Session
}

type OrganizationPatch struct {
	Name      *string
	Slug      *string
	SeatCount *int
	Timezone  *string
}
