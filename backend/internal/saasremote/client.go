// Package saasremote calls SaaS microservices from the API gateway.
package saasremote

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

type Client struct {
	cfg    config.Config
	http   *http.Client
	dx     string
	crm    string
	attend string
	contract string
	chat   string
	rag    string
}

func New(cfg config.Config) *Client {
	return &Client{
		cfg: cfg,
		http: &http.Client{Timeout: 30 * time.Second},
		dx: cfg.SaasDxURL, crm: cfg.SaasCrmURL, attend: cfg.SaasAttendanceURL,
		contract: cfg.SaasContractURL, chat: cfg.SaasChatURL, rag: cfg.SaasRagURL,
	}
}

func (c *Client) applyAuth(ctx context.Context, req *http.Request) {
	fa := tenant.ForwardAuthFrom(ctx)
	if fa.Authorization != "" {
		req.Header.Set("Authorization", fa.Authorization)
	}
	if fa.Cookie != "" {
		req.Header.Set("Cookie", fa.Cookie)
	}
	if fa.APIKey != "" {
		req.Header.Set("X-API-Key", fa.APIKey)
	}
}

func (c *Client) doJSON(ctx context.Context, method, base, path string, in any, out any) error {
	var body io.Reader
	if in != nil {
		b, err := json.Marshal(in)
		if err != nil {
			return err
		}
		body = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, strings.TrimRight(base, "/")+path, body)
	if err != nil {
		return err
	}
	if in != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	c.applyAuth(ctx, req)
	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 400 {
		var er struct {
			Error string `json:"error"`
		}
		_ = json.Unmarshal(raw, &er)
		if er.Error != "" {
			return fmt.Errorf("%s", er.Error)
		}
		return fmt.Errorf("upstream %s %s: %s", method, path, res.Status)
	}
	if out == nil {
		return nil
	}
	return json.Unmarshal(raw, out)
}

func (c *Client) ListDxInitiatives(ctx context.Context) ([]models.DxInitiative, error) {
	var out struct {
		Initiatives []models.DxInitiative `json:"initiatives"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.dx, "/initiatives", nil, &out); err != nil {
		return nil, err
	}
	return out.Initiatives, nil
}

func (c *Client) CreateDxInitiative(ctx context.Context, in models.DxInitiativeInput) (models.DxInitiative, error) {
	var out models.DxInitiative
	err := c.doJSON(ctx, http.MethodPost, c.dx, "/initiatives", in, &out)
	return out, err
}

func (c *Client) ListCrmContacts(ctx context.Context) ([]models.CrmContact, error) {
	var out struct {
		Contacts []models.CrmContact `json:"contacts"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.crm, "/contacts", nil, &out); err != nil {
		return nil, err
	}
	return out.Contacts, nil
}

func (c *Client) CreateCrmContact(ctx context.Context, in models.CrmContactInput) (models.CrmContact, error) {
	var out models.CrmContact
	err := c.doJSON(ctx, http.MethodPost, c.crm, "/contacts", in, &out)
	return out, err
}

func (c *Client) ListCrmInteractions(ctx context.Context, contactID string) ([]models.CrmInteraction, error) {
	var out struct {
		Interactions []models.CrmInteraction `json:"interactions"`
	}
	path := fmt.Sprintf("/contacts/%s/interactions", contactID)
	if err := c.doJSON(ctx, http.MethodGet, c.crm, path, nil, &out); err != nil {
		return nil, err
	}
	return out.Interactions, nil
}

func (c *Client) CreateCrmInteraction(ctx context.Context, contactID, kind, summary string) (models.CrmInteraction, error) {
	var out models.CrmInteraction
	path := fmt.Sprintf("/contacts/%s/interactions", contactID)
	err := c.doJSON(ctx, http.MethodPost, c.crm, path, map[string]string{"kind": kind, "summary": summary}, &out)
	return out, err
}

func (c *Client) ListAttendanceRecords(ctx context.Context) ([]models.AttendanceRecord, error) {
	var out struct {
		Records []models.AttendanceRecord `json:"records"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.attend, "/records", nil, &out); err != nil {
		return nil, err
	}
	return out.Records, nil
}

func (c *Client) ClockIn(ctx context.Context, note string) (models.AttendanceRecord, error) {
	var out models.AttendanceRecord
	err := c.doJSON(ctx, http.MethodPost, c.attend, "/clock-in", map[string]string{"note": note}, &out)
	return out, err
}

func (c *Client) ClockOut(ctx context.Context) (models.AttendanceRecord, error) {
	var out models.AttendanceRecord
	err := c.doJSON(ctx, http.MethodPost, c.attend, "/clock-out", nil, &out)
	return out, err
}

func (c *Client) ListLeaveRequests(ctx context.Context) ([]models.LeaveRequest, error) {
	var out struct {
		Requests []models.LeaveRequest `json:"requests"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.attend, "/leave", nil, &out); err != nil {
		return nil, err
	}
	return out.Requests, nil
}

func (c *Client) CreateLeaveRequest(ctx context.Context, start, end, reason string) (models.LeaveRequest, error) {
	var out models.LeaveRequest
	err := c.doJSON(ctx, http.MethodPost, c.attend, "/leave", map[string]string{
		"startDate": start, "endDate": end, "reason": reason,
	}, &out)
	return out, err
}

func (c *Client) ApproveLeaveRequest(ctx context.Context, id string) (models.LeaveRequest, error) {
	var out models.LeaveRequest
	err := c.doJSON(ctx, http.MethodPost, c.attend, "/leave/"+id+"/approve", nil, &out)
	return out, err
}

func (c *Client) ListContractTemplates(ctx context.Context) ([]models.ContractTemplate, error) {
	var out struct {
		Templates []models.ContractTemplate `json:"templates"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.contract, "/templates", nil, &out); err != nil {
		return nil, err
	}
	return out.Templates, nil
}

func (c *Client) CreateContractTemplate(ctx context.Context, name, body string) (models.ContractTemplate, error) {
	var out models.ContractTemplate
	err := c.doJSON(ctx, http.MethodPost, c.contract, "/templates", map[string]string{"name": name, "body": body}, &out)
	return out, err
}

func (c *Client) ListContracts(ctx context.Context) ([]models.Contract, error) {
	var out struct {
		Contracts []models.Contract `json:"contracts"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.contract, "/contracts", nil, &out); err != nil {
		return nil, err
	}
	return out.Contracts, nil
}

func (c *Client) CreateContract(ctx context.Context, templateID, title, partyName, partyEmail, body string) (models.Contract, error) {
	var out models.Contract
	err := c.doJSON(ctx, http.MethodPost, c.contract, "/contracts", map[string]string{
		"templateId": templateID, "title": title, "partyName": partyName, "partyEmail": partyEmail, "body": body,
	}, &out)
	return out, err
}

func (c *Client) SignContract(ctx context.Context, id string) (models.Contract, error) {
	var out models.Contract
	err := c.doJSON(ctx, http.MethodPost, c.contract, "/contracts/"+id+"/sign", nil, &out)
	return out, err
}

func (c *Client) ListConsultThreads(ctx context.Context) ([]models.ConsultationThread, error) {
	var out struct {
		Threads []models.ConsultationThread `json:"threads"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.chat, "/threads", nil, &out); err != nil {
		return nil, err
	}
	return out.Threads, nil
}

func (c *Client) GetConsultThread(ctx context.Context, id string) (models.ConsultationThread, []models.ConsultationMessage, error) {
	var out struct {
		Thread   models.ConsultationThread   `json:"thread"`
		Messages []models.ConsultationMessage `json:"messages"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.chat, "/threads/"+id, nil, &out); err != nil {
		return models.ConsultationThread{}, nil, err
	}
	return out.Thread, out.Messages, nil
}

func (c *Client) SendConsultation(ctx context.Context, threadID, message string) (models.ConsultMessageReply, error) {
	var out models.ConsultMessageReply
	err := c.doJSON(ctx, http.MethodPost, c.chat, "/messages", map[string]string{
		"threadId": threadID, "message": message,
	}, &out)
	return out, err
}

func (c *Client) ListRagDocuments(ctx context.Context) ([]models.RagDocument, error) {
	var out struct {
		Documents []models.RagDocument `json:"documents"`
	}
	if err := c.doJSON(ctx, http.MethodGet, c.rag, "/documents", nil, &out); err != nil {
		return nil, err
	}
	return out.Documents, nil
}

func (c *Client) CreateRagDocument(ctx context.Context, in models.RagDocumentInput) (models.RagDocument, error) {
	var out models.RagDocument
	err := c.doJSON(ctx, http.MethodPost, c.rag, "/documents", in, &out)
	return out, err
}

func (c *Client) SearchRagDocuments(ctx context.Context, query string, limit int) ([]models.RagSearchHit, error) {
	var out struct {
		Hits []models.RagSearchHit `json:"hits"`
	}
	path := fmt.Sprintf("/search?q=%s&limit=%d", url.QueryEscape(query), limit)
	if err := c.doJSON(ctx, http.MethodGet, c.rag, path, nil, &out); err != nil {
		return nil, err
	}
	return out.Hits, nil
}

func (c *Client) RagAnswer(ctx context.Context, query string) (string, []models.RagSearchHit, error) {
	var out struct {
		Answer  string               `json:"answer"`
		Sources []models.RagSearchHit `json:"sources"`
	}
	if err := c.doJSON(ctx, http.MethodPost, c.rag, "/answer", map[string]string{"query": query}, &out); err != nil {
		return "", nil, err
	}
	return out.Answer, out.Sources, nil
}

// Available reports whether the DX microservice responds on /health.
func (c *Client) Available(ctx context.Context) bool {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(c.dx, "/")+"/health", nil)
	if err != nil {
		return false
	}
	res, err := c.http.Do(req)
	if err != nil {
		return false
	}
	defer res.Body.Close()
	return res.StatusCode == http.StatusOK
}
