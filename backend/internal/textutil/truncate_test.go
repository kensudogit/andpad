package textutil

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestTruncateRunesPreservesUTF8(t *testing.T) {
	msg := "マイクロカーネル構築手順を教えて"
	got := TruncateRunes(msg, 10)
	if !utf8.ValidString(got) {
		t.Fatalf("invalid UTF-8: %q", got)
	}
	if !strings.HasSuffix(got, "...") {
		t.Fatalf("expected suffix ... got %q", got)
	}
}
