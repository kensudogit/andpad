package textutil

import "testing"

func TestDecodeJSONUnicodeEscapes(t *testing.T) {
	in := `\u6839\u7ba1\u57fa\u790e`
	want := string([]rune{0x6839, 0x7ba1, 0x57fa, 0x790e})
	if got := DecodeJSONUnicodeEscapes(in); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
	if got := DecodeJSONUnicodeEscapes("plain"); got != "plain" {
		t.Fatalf("plain text changed: %q", got)
	}
}
