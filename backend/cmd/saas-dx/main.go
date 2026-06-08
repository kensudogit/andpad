package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/dx"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-dx", "8081", dx.Register)
}
