package demo

// VideoEmbedURLs はデモ動画 ID → 歯科教育用 YouTube 埋め込み URL の対応表。
var VideoEmbedURLs map[string]string

func init() {
	VideoEmbedURLs = make(map[string]string, len(CatalogVideos()))
	for _, v := range CatalogVideos() {
		VideoEmbedURLs[v.ID] = v.EmbedURL()
	}
}

// VideoURL はインメモリ seed 向けに埋め込み URL を解決する（不明 ID は v-1 にフォールバック）。
func VideoURL(id string) string {
	if u, ok := VideoEmbedURLs[id]; ok {
		return u
	}
	return VideoEmbedURLs["v-1"]
}
