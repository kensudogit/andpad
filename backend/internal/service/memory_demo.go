package service

import (
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

const (
	memoryDemoEmail    = "demo@sakura-dental.jp"
	memoryDemoPassword = "demo1234"
)

func memoryDemoSession() models.Session {
	return models.Session{
		User: models.User{
			ID:    demoUserID,
			Email: memoryDemoEmail,
			Name:  "\u7530\u4e2d \u5065\u4e00",
		},
		Organization: models.Organization{
			ID:                 demoOrgID,
			Name:               "\u30b5\u30f3\u30d7\u30eb\u5efa\u8a2d\u682a\u5f0f\u4f1a\u793e",
			Slug:               "sample-construction-demo",
			PlanTier:           models.PlanPro,
			SubscriptionStatus: models.SubActive,
			SeatCount:          10,
			Timezone:           "Asia/Tokyo",
			MemberCount:        1,
		},
		Role: models.RoleOwner,
	}
}

func (s *Service) memoryDemoLogin(email, password string) (models.AuthPayload, error) {
	if s.Memory == nil {
		return models.AuthPayload{}, postgres.ErrInvalidCredentials
	}
	if !strings.EqualFold(strings.TrimSpace(email), memoryDemoEmail) || password != memoryDemoPassword {
		return models.AuthPayload{}, postgres.ErrInvalidCredentials
	}
	sess := memoryDemoSession()
	token, err := auth.IssueToken(
		s.Cfg.JWTSecret,
		time.Duration(s.Cfg.TokenTTLHours)*time.Hour,
		sess.User.ID,
		sess.Organization.ID,
		string(sess.Role),
		sess.User.Email,
		sess.User.Name,
	)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: sess}, nil
}

func defaultSaasModuleCatalog() []models.SaasModule {
	return []models.SaasModule{
		{Code: models.ModuleConstructionMgmt, Name: "\u65bd\u5de5\u7ba1\u7406", Description: "\u5de5\u7a0b\u8868\u30fb\u30bf\u30b9\u30af\u30fb\u9032\u6357\u306e\u4e00\u5143\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleDrawings, Name: "\u56f3\u9762", Description: "\u56f3\u9762\u306e\u7248\u7ba1\u7406\u30fb\u73fe\u5834\u5171\u6709", Enabled: true},
		{Code: models.ModuleBlackboard, Name: "\u9ed2\u677f", Description: "\u9ed2\u677f\u4ed8\u304d\u5199\u771f\u30fb\u73fe\u5834\u8a18\u9332", Enabled: true},
		{Code: models.ModuleInspection, Name: "\u691c\u67fb", Description: "\u54c1\u8cea\u691c\u67fb\u30fb\u30c1\u30a7\u30c3\u30af\u30ea\u30b9\u30c8", Enabled: true},
		{Code: models.ModuleProjectBoard, Name: "\u30dc\u30fc\u30c9", Description: "\u6848\u4ef6\u30ab\u30f3\u30d0\u30f3\u30fb\u63b2\u793a\u677f", Enabled: true},
		{Code: models.ModuleInquiryProfit, Name: "\u5f15\u5408\u7c97\u5229\u7ba1\u7406", Description: "\u898b\u7a4d\u30fb\u7c97\u5229\u30b7\u30df\u30e5\u30ec\u30fc\u30b7\u30e7\u30f3", Enabled: true},
		{Code: models.ModuleOrders, Name: "\u53d7\u767a\u6ce8", Description: "\u767a\u6ce8\u30fb\u53d7\u6ce8\u30fb\u8cc7\u6750\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleRemoteSite, Name: "\u9060\u9694\u81e8\u5834", Description: "\u30ea\u30e2\u30fc\u30c8\u73fe\u5834\u78ba\u8a8d\u30fb\u8a18\u9332", Enabled: true},
		{Code: models.ModuleDocApproval, Name: "\u8cc7\u6599\u627f\u8a8d", Description: "\u8cc7\u6599\u306e\u627f\u8a8d\u30ef\u30fc\u30af\u30d5\u30ed\u30fc", Enabled: true},
		{Code: models.ModuleScan3D, Name: "3D\u30b9\u30ad\u30e3\u30f3", Description: "3D\u30b9\u30ad\u30e3\u30f3\u30c7\u30fc\u30bf\u30fbBIM\u9023\u643a", Enabled: true},
		{Code: models.ModuleBilling, Name: "\u8acb\u6c42\u7ba1\u7406", Description: "\u8acb\u6c42\u66f8\u30fb\u5165\u91d1\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleWorkRate, Name: "\u6b69\u639b\u7ba1\u7406", Description: "\u6b69\u639b\u30fb\u6b69\u639b\u7387\u306e\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleSiteAccess, Name: "\u5165\u9000\u5834\u7ba1\u7406", Description: "\u73fe\u5834\u5165\u9000\u5834\u30fb\u30b2\u30fc\u30c8\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleEDelivery, Name: "\u96fb\u5b50\u7d0d\u54c1", Description: "\u7ae3\u5de5\u56f3\u66f8\u30fb\u691c\u67fb\u8cc7\u6599\u306e\u96fb\u5b50\u7d0d\u54c1\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleBM, Name: "BM", Description: "\u30d3\u30eb\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u30fb\u8a2d\u5099\u70b9\u691c\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleAnalytics, Name: "ANDPAD Analytics", Description: "\u6848\u4ef6\u30fb\u30b3\u30b9\u30c8\u30fb\u9032\u6357\u306e\u7d4c\u55b6\u5206\u6790", Enabled: true},
		{Code: models.ModuleAPIIntegration, Name: "API\u9023\u643a", Description: "\u5916\u90e8\u30b7\u30b9\u30c6\u30e0\u3068\u306eAPI\u30fbWebhook\u9023\u643a", Enabled: true},
		{Code: models.ModuleBIM, Name: "BIM", Description: "\u30af\u30e9\u30a6\u30c9BIM\u30d3\u30e5\u30fc\u30ef\u30fc\u30fb\u30e2\u30c7\u30eb\u5171\u6709", Enabled: true},
	}
}

func (s *Service) initMemoryModules() {
	s.memoryModuleEnabled = make(map[models.SaasModuleCode]bool, len(defaultSaasModuleCatalog()))
	for _, m := range defaultSaasModuleCatalog() {
		s.memoryModuleEnabled[m.Code] = m.Enabled
	}
}

func (s *Service) memoryMode() bool {
	return s.Memory != nil && s.PG == nil
}

func (s *Service) memoryListSaasModules() []models.SaasModule {
	out := defaultSaasModuleCatalog()
	for i := range out {
		out[i].Enabled = s.memoryModuleEnabled[out[i].Code]
	}
	return out
}

func (s *Service) memoryIsModuleEnabled(code models.SaasModuleCode) bool {
	if s.memoryModuleEnabled == nil {
		for _, m := range defaultSaasModuleCatalog() {
			if m.Code == code {
				return m.Enabled
			}
		}
		return false
	}
	enabled, ok := s.memoryModuleEnabled[code]
	return ok && enabled
}

func (s *Service) memorySetSaasModuleEnabled(code models.SaasModuleCode, enabled bool) (models.SaasModule, error) {
	if !isValidModuleCode(code) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	s.memoryModuleEnabled[code] = enabled
	for _, m := range defaultSaasModuleCatalog() {
		if m.Code == code {
			m.Enabled = enabled
			return m, nil
		}
	}
	return models.SaasModule{}, tenant.ErrForbidden
}
