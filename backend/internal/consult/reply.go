package consult

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

// GenerateReply calls OpenAI when configured; otherwise returns a setup hint in Japanese.
func GenerateReply(ctx context.Context, cfg config.Config, ai *openai.Client, history []openai.ChatMessage, message string) string {
	msg := strings.TrimSpace(message)
	if ai == nil || !cfg.OpenAIEnabled() {
		return replyWithoutOpenAI(msg)
	}
	answer, err := ai.Chat(ctx, openai.ConstructionConsultSystem, history, message)
	if err != nil {
		slog.Warn("consult openai chat failed", "error", err)
		return replyOpenAIError(msg, err)
	}
	answer = strings.TrimSpace(answer)
	if answer == "" {
		return replyWithoutOpenAI(msg)
	}
	return answer
}

func replyWithoutOpenAI(message string) string {
	topic := textutil.TruncateRunes(message, 40)
	if topic == "" {
		topic = "（質問内容）"
	}
	return fmt.Sprintf(
		"現在 OpenAI 連携（OPENAI_API_KEY）が未設定のため、AI による詳細回答を生成できません。\n\n"+
			"Railway の andpad サービス → Variables → OPENAI_API_KEY を追加し Redeploy すると、"+
			"ご質問「%s」に対する本格的な回答が得られます。\n\n"+
			"※ デモ応答として受け付けました。建設現場の安全・工程・品質管理などについてお気軽にご質問ください。",
		topic,
	)
}

func replyOpenAIError(message string, err error) string {
	topic := textutil.TruncateRunes(message, 40)
	if topic == "" {
		topic = "（質問内容）"
	}
	return fmt.Sprintf(
		"OpenAI への問い合わせに失敗しました（%s）。しばらく待ってから再送してください。\n\n（質問: %s）",
		textutil.TruncateRunes(err.Error(), 120),
		topic,
	)
}
