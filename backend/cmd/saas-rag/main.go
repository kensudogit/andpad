package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/rag"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-rag", "8086", rag.Register)
}
