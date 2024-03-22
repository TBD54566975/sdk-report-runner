package main

import (
	"errors"
	"os"

	"golang.org/x/exp/slog"

	"github.com/TBD54566975/sdk-development/reports"
)

func main() {
	allReports, err := reports.GetAllReports()
	if err != nil {
		slog.Error("error downloading/parsing reports")
		panic(err)
	}

	if err = os.Mkdir("_site", 0755); err != nil && !errors.Is(err, os.ErrExist) {
		slog.Error("error making output directory")
		panic(err)
	}

	err = reports.WriteHTML(allReports, "_site")
	if err != nil {
		slog.Error("error writing html output")
		panic(err)
	}
}
