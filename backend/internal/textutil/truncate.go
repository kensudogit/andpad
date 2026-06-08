package textutil

import "unicode/utf8"

// TruncateRunes shortens s to at most maxRunes runes and appends "..." when truncated.
// Unlike byte slicing, this preserves valid UTF-8 (required for PostgreSQL text columns).
func TruncateRunes(s string, maxRunes int) string {
	if maxRunes <= 0 {
		return ""
	}
	if utf8.RuneCountInString(s) <= maxRunes {
		return s
	}
	n := 0
	for i := range s {
		if n == maxRunes {
			return s[:i] + "..."
		}
		n++
	}
	return s
}
