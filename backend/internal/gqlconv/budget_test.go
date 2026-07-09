package gqlconv

import (
	"testing"
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func TestToBudgetLineItems(t *testing.T) {
	when := time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC)
	items := ToBudgetLineItems([]models.BudgetLineItem{
		{ID: "li-1", BudgetID: "b1", CategoryCode: "MAT", CategoryName: "材料", CreatedAt: when},
		{ID: "li-2", BudgetID: "b1", CategoryCode: "LAB", CategoryName: "労務", CreatedAt: when},
	})
	if len(items) != 2 || items[0].ID != "li-1" || items[1].CategoryCode != "LAB" {
		t.Fatalf("unexpected line items: %+v", items)
	}
}

func TestToCostEntry(t *testing.T) {
	when := time.Date(2024, 7, 8, 0, 0, 0, 0, time.UTC)
	c := ToCostEntry(models.CostEntry{
		ID: "ce-1", ProjectID: "p1", ProjectName: "案件A",
		LineItemID: "li-1", LineItemName: "材料費",
		EntryType: models.CostEntrySubcontract, VendorName: "業者X",
		Description: "外注", Amount: 500000, EntryDate: when,
		InvoiceNo: "INV-1", RecordedBy: "admin", CreatedAt: when,
	})
	if c.EntryType != generated.CostEntryTypeSubcontract || c.Amount != 500000 {
		t.Fatalf("unexpected cost entry: %+v", c)
	}
	if c.EntryDate != "2024-07-08" {
		t.Fatalf("entryDate got %q", c.EntryDate)
	}
}

func TestToProjectBudgetApprovedAt(t *testing.T) {
	when := time.Date(2024, 5, 1, 12, 0, 0, 0, time.UTC)
	approved := time.Date(2024, 5, 10, 9, 0, 0, 0, time.UTC)

	withApproved := ToProjectBudget(models.ProjectBudget{
		ID: "b1", Name: "本工事", BudgetType: models.BudgetTypeExecutionBudget,
		Status: models.BudgetStatusApproved, CreatedAt: when, ApprovedAt: &approved,
	})
	if withApproved.ApprovedAt == nil {
		t.Fatal("expected approvedAt")
	}

	without := ToProjectBudget(models.ProjectBudget{
		ID: "b2", Name: "下書き", CreatedAt: when,
	})
	if without.ApprovedAt != nil {
		t.Fatalf("expected nil approvedAt, got %v", without.ApprovedAt)
	}
}
