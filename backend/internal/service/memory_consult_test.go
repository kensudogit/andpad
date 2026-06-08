package service

import (
	"context"
	"testing"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/store"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func TestMemoryConsultTenantIsolation(t *testing.T) {
	svc := &Service{Cfg: config.Config{}, Memory: store.New()}

	ctxA := tenant.WithPrincipal(context.Background(), tenant.Principal{
		UserID: "user-a", OrgID: "org-a", Role: "MEMBER", AuthVia: "jwt",
	})
	ctxB := tenant.WithPrincipal(context.Background(), tenant.Principal{
		UserID: "user-b", OrgID: "org-b", Role: "MEMBER", AuthVia: "jwt",
	})

	_, _, err := svc.SendConsultation(ctxA, "", "tenant A message")
	if err != nil {
		t.Fatalf("send org-a: %v", err)
	}

	threadsB, err := svc.ListConsultThreads(ctxB)
	if err != nil {
		t.Fatalf("list org-b: %v", err)
	}
	if len(threadsB) != 0 {
		t.Fatalf("org-b should see no threads, got %d", len(threadsB))
	}

	threadsA, err := svc.ListConsultThreads(ctxA)
	if err != nil {
		t.Fatalf("list org-a: %v", err)
	}
	if len(threadsA) != 1 {
		t.Fatalf("org-a should see 1 thread, got %d", len(threadsA))
	}

	_, _, err = svc.GetConsultThread(ctxB, threadsA[0].ID)
	if err != tenant.ErrForbidden {
		t.Fatalf("cross-tenant get should be forbidden, got %v", err)
	}
}

func TestMemoryConsultAdminOrgWide(t *testing.T) {
	svc := &Service{Cfg: config.Config{}, Memory: store.New()}

	ctxMember := tenant.WithPrincipal(context.Background(), tenant.Principal{
		UserID: "user-m", OrgID: "org-x", Role: "MEMBER", AuthVia: "jwt",
	})
	ctxAdmin := tenant.WithPrincipal(context.Background(), tenant.Principal{
		UserID: "user-admin", OrgID: "org-x", Role: "OWNER", AuthVia: "jwt",
	})

	_, _, err := svc.SendConsultation(ctxMember, "", "member thread")
	if err != nil {
		t.Fatalf("send member: %v", err)
	}

	adminThreads, err := svc.ListConsultThreads(ctxAdmin)
	if err != nil {
		t.Fatalf("list admin: %v", err)
	}
	if len(adminThreads) != 1 {
		t.Fatalf("admin should see org threads, got %d", len(adminThreads))
	}
}
