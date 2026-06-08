package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/crm"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-crm", "8082", crm.Register)
}
