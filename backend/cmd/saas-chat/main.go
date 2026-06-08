package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/chat"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-chat", "8085", chat.Register)
}
