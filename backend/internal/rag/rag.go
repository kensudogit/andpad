package rag

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"unicode/utf8"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

const DentalRagSystem = `You are a dental clinic document assistant for licensed staff in Japan.
Answer using only the provided internal documents. If the documents do not contain enough information, say so clearly.
Respond in Japanese unless the user writes in another language.`

// LocalSearch finds documents whose title or content contains the query (Japanese-friendly).
func LocalSearch(docs []models.RagDocument, query string, limit int) []models.RagSearchHit {
	q := strings.TrimSpace(query)
	if q == "" || len(docs) == 0 {
		return nil
	}
	if limit <= 0 {
		limit = 5
	}
	qLower := strings.ToLower(q)
	var out []models.RagSearchHit
	for _, d := range docs {
		titleLower := strings.ToLower(d.Title)
		contentLower := strings.ToLower(d.Content)
		score := 0.0
		switch {
		case strings.Contains(titleLower, qLower):
			score = 1.0
		case strings.Contains(contentLower, qLower):
			score = 0.7
		default:
			continue
		}
		out = append(out, models.RagSearchHit{
			DocumentID: d.ID,
			Title:      d.Title,
			Snippet:    Snippet(d.Content, q, 180),
			Score:      score,
		})
		if len(out) >= limit {
			break
		}
	}
	return out
}

// Snippet extracts a UTF-8 safe excerpt around the query.
func Snippet(content, query string, maxRunes int) string {
	if maxRunes <= 0 {
		maxRunes = 180
	}
	lower := strings.ToLower(content)
	idx := strings.Index(lower, strings.ToLower(strings.TrimSpace(query)))
	if idx < 0 {
		return textutil.TruncateRunes(content, maxRunes)
	}
	start := idx - maxRunes/4
	if start < 0 {
		start = 0
	}
	end := start + maxRunes*4
	if end > len(content) {
		end = len(content)
	}
	s := content[start:end]
	if !utf8.ValidString(s) {
		return textutil.TruncateRunes(content, maxRunes)
	}
	if start > 0 {
		s = "..." + textutil.TruncateRunes(s, maxRunes)
	} else {
		s = textutil.TruncateRunes(s, maxRunes)
	}
	return s
}

func buildContextBlock(hits []models.RagSearchHit, docs []models.RagDocument, maxContentRunes int) string {
	var b strings.Builder
	for _, hit := range hits {
		for _, d := range docs {
			if d.ID != hit.DocumentID {
				continue
			}
			b.WriteString(d.Title)
			b.WriteString(":\n")
			b.WriteString(textutil.TruncateRunes(d.Content, maxContentRunes))
			b.WriteString("\n\n")
			break
		}
	}
	return b.String()
}

func formatHitsAsAnswer(hits []models.RagSearchHit) string {
	if len(hits) == 0 {
		return "関連する文書が見つかりませんでした。文書を登録するか、別のキーワードで検索してください。"
	}
	var b strings.Builder
	b.WriteString("登録文書から見つかった関連情報です。\n\n")
	for i, h := range hits {
		if i >= 3 {
			break
		}
		fmt.Fprintf(&b, "【%s】\n%s\n\n", h.Title, h.Snippet)
	}
	b.WriteString("（OPENAI_API_KEY を設定すると、参照文書に基づく要約回答を生成できます。）")
	return b.String()
}

// GenerateAnswer synthesizes an answer from search hits and optional OpenAI.
func GenerateAnswer(
	ctx context.Context,
	cfg config.Config,
	ai *openai.Client,
	query string,
	hits []models.RagSearchHit,
	docs []models.RagDocument,
) string {
	q := strings.TrimSpace(query)
	if len(hits) == 0 {
		return formatHitsAsAnswer(nil)
	}
	if hits[0].Title == "AI 回答" {
		return hits[0].Snippet
	}
	if ai == nil || !cfg.OpenAIEnabled() {
		return formatHitsAsAnswer(hits)
	}
	ctxBlock := buildContextBlock(hits, docs, 600)
	if ctxBlock == "" {
		return formatHitsAsAnswer(hits)
	}
	prompt := "参照文書に基づき質問に答えてください。根拠がない場合はその旨を述べてください。\n\n" +
		ctxBlock + "\n\n質問: " + q
	answer, err := ai.Chat(ctx, DentalRagSystem, nil, prompt)
	if err != nil {
		slog.Warn("rag openai chat failed", "error", err)
		return formatHitsAsAnswer(hits)
	}
	answer = strings.TrimSpace(answer)
	if answer == "" {
		return formatHitsAsAnswer(hits)
	}
	return answer
}

// FallbackSearchWhenEmpty uses registered documents + OpenAI when keyword search returns nothing.
func FallbackSearchWhenEmpty(
	ctx context.Context,
	cfg config.Config,
	ai *openai.Client,
	query string,
	docs []models.RagDocument,
) []models.RagSearchHit {
	if ai == nil || !cfg.OpenAIEnabled() || strings.TrimSpace(query) == "" || len(docs) == 0 {
		return nil
	}
	ctxBlock := ""
	for i, d := range docs {
		if i >= 3 {
			break
		}
		ctxBlock += d.Title + ":\n" + textutil.TruncateRunes(d.Content, 800) + "\n\n"
	}
	answer, err := ai.Chat(ctx, DentalRagSystem, nil,
		"以下の院内文書を参照し、質問に簡潔に答えてください。\n\n"+ctxBlock+"\n\n質問: "+query)
	if err != nil || strings.TrimSpace(answer) == "" {
		return nil
	}
	return []models.RagSearchHit{{
		DocumentID: docs[0].ID,
		Title:      "AI 回答",
		Snippet:    answer,
		Score:      0.5,
	}}
}
