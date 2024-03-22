package reports

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	badge "github.com/essentialkaos/go-badge"
	"golang.org/x/exp/slog"
)

var (
	badgeGenerator *badge.Generator

	fonts = []string{
		"/System/Library/Fonts/Supplemental/Verdana.ttf",   // OSX
		"/usr/share/fonts/truetype/arkpandora/Veranda.ttf", // CI from Ubuntu package `fonts-arkpandora`
	}
)

func init() {
	var err error

	fontPath := ""
	for _, potentialFontPath := range fonts {
		if _, err := os.Stat(potentialFontPath); err != nil {
			continue
		}
		fontPath = potentialFontPath
	}
	if fontPath == "" {
		panic(fmt.Sprintf("Font not found in any of:\n%s", strings.Join(fonts, "\n")))
	}

	badgeGenerator, err = badge.NewGenerator(fontPath, 11)
	if err != nil {
		panic(err)
	}
}

type Badge struct {
	Name    string
	Error   bool
	Passing int
	Total   int
}

func (b Badge) Render(dir string) error {
	color := badge.COLOR_BRIGHTGREEN
	if b.Error {
		color = badge.COLOR_RED
	}

	filename := filepath.Join(dir, fmt.Sprintf("%s.svg", b.Name))
	slog.Info("writing badge", "filename", filename)
	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	text := fmt.Sprintf("%d/%d", b.Passing, b.Total)
	badgeBytes := badgeGenerator.GenerateFlat("spec compliance", text, color)

	if _, err := f.Write(badgeBytes); err != nil {
		return err
	}

	return nil
}
