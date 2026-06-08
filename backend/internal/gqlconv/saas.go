package gqlconv

// SaaS 組織・分析系の GraphQL 変換

import (
	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func ToUser(u models.User) *generated.User {
	var av *string
	if u.AvatarURL != "" {
		av = &u.AvatarURL
	}
	return &generated.User{ID: u.ID, Email: u.Email, Name: u.Name, AvatarURL: av}
}

func ToOrganization(o models.Organization) *generated.Organization {
	return &generated.Organization{
		ID: o.ID, Name: o.Name, Slug: o.Slug,
		PlanTier: generated.PlanTier(o.PlanTier), SubscriptionStatus: generated.SubscriptionStatus(o.SubscriptionStatus),
		SeatCount: o.SeatCount, Timezone: o.Timezone, MemberCount: o.MemberCount,
		CreatedAt: fmtTime(o.CreatedAt), EnabledModules: []*generated.SaasModule{},
	}
}

func ToOrganizationWithModules(o models.Organization, modules []models.SaasModule) *generated.Organization {
	org := ToOrganization(o)
	org.EnabledModules = ToEnabledSaasModules(modules)
	return org
}

func ToSession(s models.Session) *generated.Session {
	return &generated.Session{
		User: ToUser(s.User), Organization: ToOrganization(s.Organization), Role: generated.MemberRole(s.Role),
	}
}

func ToSessionWithModules(s models.Session, modules []models.SaasModule) *generated.Session {
	return &generated.Session{
		User: ToUser(s.User), Organization: ToOrganizationWithModules(s.Organization, modules),
		Role: generated.MemberRole(s.Role),
	}
}

func ToTeamMember(m models.TeamMember, u models.User) *generated.TeamMember {
	return &generated.TeamMember{
		ID: m.ID, User: ToUser(u), Role: generated.MemberRole(m.Role),
		JoinedAt: fmtTime(m.JoinedAt), LastActiveAt: fmtTime(m.LastActiveAt),
	}
}

func ToUsageSummary(u models.UsageSummary) *generated.UsageSummary {
	return &generated.UsageSummary{
		Members: u.Members, MembersLimit: u.MembersLimit,
		Videos: u.Videos, VideosLimit: u.VideosLimit,
		APICallsThisMonth: u.APICallsThisMonth, APICallsLimit: u.APICallsLimit,
		ConsultTokensMonth: u.ConsultTokensMonth,
	}
}

func ToAnalyticsBoard(b models.AnalyticsBoard) *generated.AnalyticsBoard {
	kpis := make([]*generated.AnalyticsKpi, len(b.Kpis))
	for i, k := range b.Kpis {
		var u *string
		if k.Unit != "" {
			u = &k.Unit
		}
		t := k.TrendPct
		kpis[i] = &generated.AnalyticsKpi{Label: k.Label, Value: k.Value, Unit: u, TrendPct: &t}
	}
	cats := make([]*generated.CategoryMetric, len(b.CompletionsByCategory))
	for i, c := range b.CompletionsByCategory {
		cats[i] = &generated.CategoryMetric{Category: models.VideoCategory(c.Category), Count: c.Count}
	}
	tops := make([]*generated.VideoMetric, len(b.TopVideos))
	for i, v := range b.TopVideos {
		tops[i] = &generated.VideoMetric{VideoID: v.VideoID, Title: v.Title, Views: v.Views, Completions: v.Completions}
	}
	return &generated.AnalyticsBoard{
		PeriodDays: b.PeriodDays, Kpis: kpis, WatchHoursByWeek: b.WatchHoursByWeek,
		CompletionsByCategory: cats, TopVideos: tops, LearnerEngagementScore: b.LearnerEngagementScore,
	}
}

func ToAnalyticsInsight(i models.AnalyticsInsight) *generated.AnalyticsInsight {
	return &generated.AnalyticsInsight{
		Summary: i.Summary, Strengths: i.Strengths, Risks: i.Risks,
		Recommendations: i.Recommendations, GeneratedAt: i.GeneratedAt,
	}
}

func PatchFromInput(in generated.UpdateOrganizationInput) models.OrganizationPatch {
	var p models.OrganizationPatch
	if in.Name != nil {
		p.Name = in.Name
	}
	if in.Slug != nil {
		p.Slug = in.Slug
	}
	if in.SeatCount != nil {
		p.SeatCount = in.SeatCount
	}
	if in.Timezone != nil {
		p.Timezone = in.Timezone
	}
	return p
}
