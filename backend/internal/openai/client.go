// Package openai は歯科クリニック向け AI 相談・分析インサイト用の Chat Completions クライアント。
package openai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/config"
)

// Client は API キー未設定時は nil（service 層がフォールバック処理）。
type Client struct {
	apiKey string
	model  string
	http   *http.Client
}

func New(cfg config.Config) *Client {
	if !cfg.OpenAIEnabled() {
		return nil
	}
	return &Client{
		apiKey: cfg.OpenAIAPIKey,
		model:  cfg.OpenAIModel,
		http:   &http.Client{Timeout: 90 * time.Second},
	}
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
}

type chatResponse struct {
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *Client) Chat(ctx context.Context, systemPrompt string, history []ChatMessage, userMessage string) (string, error) {
	if c == nil {
		return "", fmt.Errorf("OPENAI_API_KEY is not configured")
	}
	msgs := []ChatMessage{{Role: "system", Content: systemPrompt}}
	msgs = append(msgs, history...)
	msgs = append(msgs, ChatMessage{Role: "user", Content: userMessage})

	body, _ := json.Marshal(chatRequest{Model: c.model, Messages: msgs})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.openai.com/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	res, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(res.Body)
	var out chatResponse
	if err := json.Unmarshal(raw, &out); err != nil {
		return "", err
	}
	if out.Error != nil {
		return "", fmt.Errorf("openai: %s", out.Error.Message)
	}
	if res.StatusCode >= 400 {
		return "", fmt.Errorf("openai http %d: %s", res.StatusCode, strings.TrimSpace(string(raw)))
	}
	if len(out.Choices) == 0 {
		return "", fmt.Errorf("openai: empty response")
	}
	return out.Choices[0].Message.Content, nil
}

// ConstructionAnalyticsSystem は建設 PM KPI JSON から経営向けインサイト JSON を生成させる。
const ConstructionAnalyticsSystem = `You are a construction project management analyst (AI Board). Given JSON analytics KPIs for a construction PM platform, respond ONLY with valid JSON:
{"summary":"...","strengths":["..."],"risks":["..."],"recommendations":["..."]}
Write in Japanese. Focus on project delivery, schedule risk, module adoption, billing trends, safety/compliance awareness, and actionable site management advice.`

// DentalAnalyticsSystem は後方互換の別名。
const DentalAnalyticsSystem = ConstructionAnalyticsSystem

// ConstructionConsultSystem は建設プロジェクト管理向け AI アシスタントの振る舞いを定義する。
const ConstructionConsultSystem = `You are an AI assistant for construction project management professionals in Japan (ANDPAD-style platform).
Help with site safety, schedule coordination, subcontractor management, quality inspection, document workflows, BIM/digital delivery, and general construction PM best practices.
Be practical and concise. When unsure, say what information is needed and suggest checking site rules or consulting a qualified supervisor.
Do not provide legally binding engineering sign-off. Respond in Japanese unless the user writes in another language.`

// DentalConsultSystem は後方互換の別名（consult パッケージから参照）。
const DentalConsultSystem = ConstructionConsultSystem
