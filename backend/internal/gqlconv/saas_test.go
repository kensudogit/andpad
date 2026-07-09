package gqlconv

import (
	"testing"
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func TestToOrganization(t *testing.T) {
	when := time.Date(2024, 1, 2, 3, 4, 5, 0, time.UTC)
	org := ToOrganization(models.Organization{
		ID: "org-1", Name: "桜歯科", Slug: "sakura",
		PlanTier: models.PlanPro, SubscriptionStatus: models.SubActive,
		SeatCount: 10, Timezone: "Asia/Tokyo", MemberCount: 3, CreatedAt: when,
	})
	if org.ID != "org-1" || org.Name != "桜歯科" {
		t.Fatalf("unexpected org: %+v", org)
	}
	if org.PlanTier != generated.PlanTierPro {
		t.Fatalf("plan tier got %q", org.PlanTier)
	}
	if len(org.EnabledModules) != 0 {
		t.Fatalf("expected empty modules, got %d", len(org.EnabledModules))
	}
}

func TestToOrganizationWithModules(t *testing.T) {
	org := ToOrganizationWithModules(models.Organization{ID: "org-1", Name: "Demo"}, []models.SaasModule{
		{Code: models.ModuleCRM, Name: "CRM", Description: "顧客管理", Enabled: true},
	})
	if len(org.EnabledModules) != 1 || org.EnabledModules[0].Code != generated.SaasModuleCodeCrm {
		t.Fatalf("unexpected modules: %+v", org.EnabledModules)
	}
}

func TestToUserAvatarURL(t *testing.T) {
	withAvatar := ToUser(models.User{ID: "u1", Email: "a@b.jp", Name: "A", AvatarURL: "https://x/a.png"})
	if withAvatar.AvatarURL == nil || *withAvatar.AvatarURL != "https://x/a.png" {
		t.Fatalf("expected avatar url pointer, got %+v", withAvatar.AvatarURL)
	}
	without := ToUser(models.User{ID: "u2", Email: "b@b.jp", Name: "B"})
	if without.AvatarURL != nil {
		t.Fatalf("expected nil avatar, got %+v", without.AvatarURL)
	}
}

func TestPatchFromInput(t *testing.T) {
	name := "新名称"
	seats := 20
	patch := PatchFromInput(generated.UpdateOrganizationInput{
		Name: &name, SeatCount: &seats,
	})
	if patch.Name == nil || *patch.Name != name {
		t.Fatalf("name patch missing: %+v", patch)
	}
	if patch.SeatCount == nil || *patch.SeatCount != seats {
		t.Fatalf("seat patch missing: %+v", patch)
	}
}
