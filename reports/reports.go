package reports

import (
	"embed"
	"errors"
	htmltemplate "html/template"
	"regexp"
	"time"

	junit "github.com/joshdk/go-junit"
)

var (
	ErrNotSupported = errors.New("test not supported by this SDK")

	//go:embed report-template.html
	templatesFS embed.FS

	htmlTemplates = htmltemplate.New("")
	funcmap       = map[string]any{
		"sanatizeHTML": sanatizeHTML,
	}
)

func init() {
	htmlTemplates.Funcs(funcmap)
	if _, err := htmlTemplates.ParseFS(templatesFS, "report-template.html"); err != nil {
		panic(err)
	}
}

type SDKMeta struct {
	Name         string
	Repo         string
	ArtifactName string
	FeatureRegex *regexp.Regexp
	VectorRegex  *regexp.Regexp
	VectorPath   string
	Type         string
}

type Report struct {
	SDK     SDKMeta
	Results map[string]map[string]Result
}

type Result struct {
	Exists bool
	Errors []error
	Time   time.Duration
}

func (r Report) IsPassing() bool {
	for _, results := range r.Results {
		for _, result := range results {
			if result.IsSkipped() {
				continue
			}

			if len(result.Errors) > 0 {
				return false
			}
		}

	}

	return true
}

func (r Result) IsSkipped() bool {
	return len(r.Errors) == 1 && r.Errors[0] == ErrNotSupported
}

func (r Result) GetEmoji() string {
	if !r.Exists {
		return "🚧"
	}

	if len(r.Errors) == 0 {
		return "✅"
	}

	return "❌"
}

func (r Result) GetEmojiAriaLabel() string {
	if !r.Exists {
		return "In progress"
	}

	if len(r.Errors) == 0 {
		return "Success"
	}

	return "Failed"
}
func (s SDKMeta) buildReport(suites []junit.Suite) (Report, error) {
	results := make(map[string]map[string]Result)
	vectorsToUse := getKnownVectors(s.Type)

	for feature, vectors := range vectorsToUse {
		results[feature] = make(map[string]Result)
		for vector := range vectors {
			results[feature][vector] = Result{}
		}
	}

	for _, suite := range suites {
		feature := extractFeature(suite.Name, s.FeatureRegex)

		for _, test := range suite.Tests {
			vector := extractTestName(test.Name, s.VectorRegex)

			errs := []error{}
			if test.Error != nil {
				errs = append(errs, test.Error)
			}

			if vectorsToUse[feature][vector] {
				results[feature][vector] = Result{
					Exists: true,
					Errors: errs,
					Time:   test.Duration,
				}
			}
		}
	}

	return Report{
		SDK:     s,
		Results: results,
	}, nil
}

func extractFeature(input string, featureRegex *regexp.Regexp) string {
	matches := featureRegex.FindStringSubmatch(input)
	// If a match is found, it will be in the second element of the 'matches' slice.
	if len(matches) >= 2 {
		return matches[1] // Return the captured group, which is the part of interest.
	}

	return ""
}

func extractTestName(input string, testRegex *regexp.Regexp) string {
	matches := testRegex.FindStringSubmatch(input)

	if len(matches) > 0 {
		return matches[len(matches)-1]
	}

	return ""
}
