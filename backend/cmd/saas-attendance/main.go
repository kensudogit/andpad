package main

import (
	"github.com/pluszero/dental-video-api/internal/microsvc/attendance"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
)

func main() {
	runtime.Run("saas-attendance", "8083", attendance.Register)
}
