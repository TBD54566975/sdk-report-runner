package reports

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/exp/slog"
)

func sanatizeHTML(dirty error) string {
	clean := strings.ReplaceAll(dirty.Error(), "<", "&lt;")
	clean = strings.ReplaceAll(clean, ">", "&gt;")
	clean = strings.ReplaceAll(clean, "\n", "\\\\n")

	return clean
}

type htmlTemplateInput struct {
	Reports      []Report
	Web5Reports  []Report
	TbdexReports []Report
	Web5Tests    map[string][]string
	TbDEXTests   map[string][]string
	CreationTime string
}

func WriteHTML(reports []Report, destinationDir string) error {
	slog.Info("writing html report", "reports", len(reports))

	testmap := make(map[string]map[string]bool)
	tbdexTestMap := make(map[string]map[string]bool)
	for _, report := range reports {
		badge := Badge{Name: report.SDK.Name}
		slog.Info("debug", "result_count", len(report.Results))
		for category, tests := range report.Results {
			if _, ok := tests[category]; !ok {
				if report.SDK.Type == "web5" {
					testmap[category] = map[string]bool{}
				} else {
					tbdexTestMap[category] = map[string]bool{}
				}
			}

			badge.Total += len(tests)

			for test := range tests {
				if report.SDK.Type == "web5" {
					testmap[category][test] = true
				} else {
					tbdexTestMap[category][test] = true
				}

				if tests[test].Exists {
					if len(tests[test].Errors) > 0 {
						badge.Error = true
					} else {
						badge.Passing += 1
					}
				}
			}
		}

		if err := badge.Render(destinationDir); err != nil {
			return fmt.Errorf("error generating badge: %v", err)
		}
	}

	var web5Reports []Report
	for _, report := range reports {
		if report.SDK.Type == "web5" {
			web5Reports = append(web5Reports, report)
		}
	}

	var tbdexReports []Report
	for _, report := range reports {
		if report.SDK.Type == "tbdex" {
			tbdexReports = append(tbdexReports, report)
		}
	}

	templateInput := htmlTemplateInput{
		Reports:      reports,
		Web5Reports:  web5Reports,
		TbdexReports: tbdexReports,
		Web5Tests:    make(map[string][]string),
		TbDEXTests:   make(map[string][]string),
		CreationTime: time.Now().Format("2006-01-02 15:04:05"),
	}

	for category, tests := range testmap {
		for test := range tests {
			templateInput.Web5Tests[category] = append(templateInput.Web5Tests[category], test)
		}
	}

	for category, tests := range tbdexTestMap {
		for test := range tests {
			templateInput.TbDEXTests[category] = append(templateInput.TbDEXTests[category], test)
		}
	}

	indexFilename := filepath.Join(destinationDir, "index.html")
	slog.Info("writing index.html", "file", indexFilename)
	f, err := os.Create(indexFilename)
	if err != nil {
		return fmt.Errorf("error opening %s: %v", indexFilename, err)
	}
	defer f.Close()

	if err := htmlTemplates.ExecuteTemplate(f, "report-template.html", templateInput); err != nil {
		return err
	}

	return nil
}
