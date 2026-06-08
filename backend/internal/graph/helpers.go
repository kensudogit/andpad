package graph

// pageArgs は GraphQL の省略可能なページ引数にデフォルト（1 ページ・12 件）を適用する。
func pageArgs(page, pageSize *int) (int, int) {
	p, ps := 1, 12
	if page != nil && *page > 0 {
		p = *page
	}
	if pageSize != nil && *pageSize > 0 {
		ps = *pageSize
	}
	return p, ps
}
