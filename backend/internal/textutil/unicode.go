// Package textutil は DB や JSON 経由で壊れた日本語文字列の修復ユーティリティ。
package textutil

import (
	"strconv"
	"strings"
)

// DecodeJSONUnicodeEscapes はリテラル \uXXXX を UTF-8 文字に戻す。
// 初期シードでエスケープがそのまま DB に入った行の表示用。
func DecodeJSONUnicodeEscapes(s string) string {
	if !strings.Contains(s, `\u`) {
		return s
	}
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		if i+6 <= len(s) && s[i] == '\\' && s[i+1] == 'u' {
			if code, err := strconv.ParseInt(s[i+2:i+6], 16, 32); err == nil {
				b.WriteRune(rune(code))
				i += 5
				continue
			}
		}
		b.WriteByte(s[i])
	}
	return b.String()
}
