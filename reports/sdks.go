package reports

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/google/go-github/v57/github"
	"github.com/joshdk/go-junit"
	"golang.org/x/exp/slog"
)

var (
	SDKs = []SDKMeta{
		{
			Name:         "web5-js",
			Repo:         "TBD54566975/web5-js",
			ArtifactName: "junit-results",
			FeatureRegex: regexp.MustCompile(`Web5TestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`.* Web5TestVectors\w+ (\w+)`),
			VectorPath:   "test-vectors",
			Type:         "web5",
		},
		{
			Name:         "web5-kt",
			Repo:         "TBD54566975/web5-kt",
			ArtifactName: "tests-report-junit",
			FeatureRegex: regexp.MustCompile(`Web5TestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`(\w+)`),
			VectorPath:   "test-vectors",
			Type:         "web5",
		},
		{
			Name:         "web5-swift",
			Repo:         "TBD54566975/web5-swift",
			ArtifactName: "test-results",
			FeatureRegex: regexp.MustCompile(`Web5TestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`test_(\w+)`),
			VectorPath:   "test-vectors",
			Type:         "web5",
		},
		{
			Name:         "web5-rs",
			Repo:         "TBD54566975/web5-rs",
			ArtifactName: "rust-test-results",
			FeatureRegex: regexp.MustCompile(`::(\w+)::(\w+)::(\w+)`),
			VectorRegex:  regexp.MustCompile(`::(\w+)$`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "web5",
		},
		{
			Name:         "web5-core-kt",
			Repo:         "TBD54566975/web5-rs",
			ArtifactName: "kotlin-test-results",
			FeatureRegex: regexp.MustCompile(`Web5TestVectorsTest\$Web5TestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`(\w+)`),
			VectorPath:   "test-vectors",
			Type:         "web5",
		},
		{
			Name:         "tbdex-js",
			Repo:         "TBD54566975/tbdex-js",
			ArtifactName: "junit-results",
			FeatureRegex: regexp.MustCompile(`TbdexTestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`TbdexTestVectors(\w+) (\w+)`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "tbdex",
		},
		{
			Name:         "tbdex-kt",
			Repo:         "TBD54566975/tbdex-kt",
			ArtifactName: "tests-report-junit",
			FeatureRegex: regexp.MustCompile(`tbdex\.sdk\.\w+.TbdexTestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`(\w+)`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "tbdex",
		},
		{
			Name:         "tbdex-go",
			Repo:         "TBD54566975/tbdex-go",
			ArtifactName: "go-test-results",
			FeatureRegex: regexp.MustCompile(`TbdexTestVectors(\w+)`),
			VectorRegex:  regexp.MustCompile(`TestAllParsers/(\w+)`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "tbdex",
		},
		{
			Name:         "tbdex-rs",
			Repo:         "TBD54566975/tbdex-rs",
			ArtifactName: "rust-test-results",
			FeatureRegex: regexp.MustCompile(`TbdexTestVectors(\w+)Test`),
			VectorRegex:  regexp.MustCompile(`::(\w+)$`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "tbdex",
		},
		{
			Name:         "tbdex-core-kt",
			Repo:         "TBD54566975/tbdex-rs",
			ArtifactName: "kotlin-test-results",
			FeatureRegex: regexp.MustCompile(`tbdex\.sdk\.\w+\.TbdexTestVectors(\w+)Test`),
			VectorRegex:  regexp.MustCompile(`(\w+)`),
			VectorPath:   "tbdex-test-vectors",
			Type:         "tbdex",
		},
	}
)

func GetAllReports() ([]Report, error) {
	ctx := context.Background()

	var reports []Report
	for _, sdk := range SDKs {
		slog.Info("Processing: " + sdk.Name)
		artifact, err := downloadArtifact(ctx, sdk)
		//artifact, err := downloadLocal(ctx, sdk)
		if err != nil {
			slog.Error(fmt.Sprintf("error downloading artifact from %s: %v. continuing..", sdk.Repo, err))
			continue
		}

		suites, err := readArtifactZip(artifact)
		if err != nil {
			return nil, fmt.Errorf("error parsing artifact from %s: %v", sdk.Repo, err)
		}

		var web5TestVectorSuites []junit.Suite

		var searchString string
		if sdk.Type == "web5" {
			searchString = "Web5TestVector"
		} else if sdk.Type == "tbdex" {
			searchString = "TbdexTestVector"
		}

		for _, suite := range suites {
			if strings.Contains(suite.Name, searchString) {
				web5TestVectorSuites = append(web5TestVectorSuites, suite)
			}
		}

		if len(web5TestVectorSuites) > 0 {
			fmt.Println("Found these Test Vector Suites:")
			for _, suite := range web5TestVectorSuites {
				fmt.Println("-", suite.Name)
			}
		} else {
			fmt.Println("No Test Vector Suites found.")
		}

		err = CheckSubmoduleStatus(context.Background())
		if err != nil {
			fmt.Println("Error checking submodule status: %v", err)
		}

		var report Report
		if sdk.Name == "web5-rs" {
			report, err = sdk.buildReportWeb5Rs(web5TestVectorSuites)
		} else {
			report, err = sdk.buildReport(web5TestVectorSuites)
		}

		if err != nil {
			return nil, fmt.Errorf("error processing data from %s: %v", sdk.Repo, err)
		}

		reports = append(reports, report)
	}

	return reports, nil
}

func downloadArtifact(ctx context.Context, sdk SDKMeta) ([]byte, error) {
	owner, repo, _ := strings.Cut(sdk.Repo, "/")

	slog.Info("~~Downloading artifact from ", owner+"/"+repo)

	slog.Info("owner:" + owner)
	slog.Info("repo:" + repo)

	listOptions := &github.ListOptions{PerPage: 100}
	artifacts, respz, err := gh.Actions.ListArtifacts(ctx, owner, repo, listOptions)
	if (err != nil) || (respz.StatusCode != http.StatusOK) {
		slog.Error("Error listing artifacts", "owner", owner, "repo", repo, "response", respz, "error", err)
		return nil, fmt.Errorf("error getting artifact list: %v", err)
	}

	if len(artifacts.Artifacts) == 0 {
		return nil, fmt.Errorf("~~no artifacts found, throwing error and returning")
	}

	var artifactURL string
	for _, a := range artifacts.Artifacts {
		slog.Info("checking artifact: " + *a.Name + " branch: " + a.GetWorkflowRun().GetHeadBranch())
		if a.GetWorkflowRun().GetHeadBranch() != "main" {
			continue
		}

		slog.Info("artifact found: " + *a.Name + " at: " + *a.ArchiveDownloadURL)
		if *a.Name == sdk.ArtifactName {
			artifactURL = *a.ArchiveDownloadURL
			slog.Info("downloading artifact", "repo", sdk.Repo, "commit", a.GetWorkflowRun().GetHeadSHA(), "url", artifactURL)
			break
		}
	}

	if artifactURL == "" {
		return nil, fmt.Errorf("~~no matching artifact found for %s", sdk.ArtifactName)
	}

	req, err := http.NewRequest(http.MethodGet, artifactURL, nil)
	if err != nil {
		return nil, err
	}
	bearer := ghToken
	if ghToken == "" {
		bearer, err = ghTransport.Token(ctx)
		if err != nil {
			return nil, fmt.Errorf("error getting github token: %v", err)
		}
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", bearer))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making http request to %s: %v", artifactURL, err)
	}
	defer resp.Body.Close()

	artifact, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	slog.Info("downloaded artifact", "sdk", sdk.Repo, "size", len(artifact))

	return artifact, nil
}

func CheckSubmoduleStatus(ctx context.Context) error {
	for _, sdk := range SDKs {
		owner, repo, _ := strings.Cut(sdk.Repo, "/")

		// Determine submodule name based on SDK type
		submoduleName := "web5-spec"
		if sdk.Type == "tbdex" {
			submoduleName = "tbdex"
		}

		// Get the current submodule commit
		submoduleRef, _, err := gh.Git.GetRef(ctx, owner, repo, "heads/main")
		if err != nil {
			return fmt.Errorf("error getting ref for %s: %v", sdk.Repo, err)
		}

		tree, _, err := gh.Git.GetTree(ctx, owner, repo, *submoduleRef.Object.SHA, true)
		if err != nil {
			return fmt.Errorf("error getting tree for %s: %v", sdk.Repo, err)
		}

		var submoduleCommit string
		for _, entry := range tree.Entries {
			if *entry.Path == submoduleName {
				submoduleCommit = *entry.SHA
				break
			}
		}

		if submoduleCommit == "" {
			fmt.Printf("submodule %s not found in %s\n", submoduleName, sdk.Repo)
			continue
		}

		// Get the latest commit of the submodule repo
		submoduleOwner := "TBD54566975"
		submoduleRepo := submoduleName
		latestCommit, _, err := gh.Repositories.GetCommit(ctx, submoduleOwner, submoduleRepo, "main", nil)
		if err != nil {
			return fmt.Errorf("error getting latest commit for %s: %v", submoduleRepo, err)
		}

		// Compare commits
		comparison, _, err := gh.Repositories.CompareCommits(ctx, submoduleOwner, submoduleRepo, submoduleCommit, *latestCommit.SHA, nil)
		if err != nil {
			return fmt.Errorf("error comparing commits for %s: %v", submoduleRepo, err)
		}

		slog.Info("Repo: %s\n", sdk.Repo)
		slog.Info("Submodule: %s\n", submoduleName)
		slog.Info("Current commit: %s\n", submoduleCommit[:7])
		slog.Info("Latest commit: %s\n", (*latestCommit.SHA)[:7])
		slog.Info("Commits behind: %d\n", comparison.BehindBy)
		slog.Info("--------------------")
	}

	return nil
}

// Used for testing purposes
func downloadLocal(ctx context.Context, sdk SDKMeta) ([]byte, error) {
	//data, err := os.ReadFile("../tbdex-junit-results.zip")
	//data, err := os.ReadFile("../tbdex-kt-tests-report-junit.zip")
	//data, err := os.ReadFile("../junit-results.zip")
	//data, err := os.ReadFile("../tbdex-junit-results.zip")
	//data, err := os.ReadFile("../tests-report-junit.zip")
	//data, err := os.ReadFile("../junit-results-js-custom.zip")
	//data, err := os.ReadFile("../kotlin-test-results.zip")
	//data, err := os.ReadFile("../rust-test-results.zip")
	//data, err := os.ReadFile("../go-test-results.zip")
	data, err := os.ReadFile("../kotlin-test-results.zip")
	//data, err := os.ReadFile("../tbdex-rust-test-results.zip")
	if err != nil {
		return nil, err
	}

	return data, nil
}
