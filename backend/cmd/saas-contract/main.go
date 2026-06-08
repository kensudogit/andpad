package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/contract"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-contract", "8084", contract.Register)
}
