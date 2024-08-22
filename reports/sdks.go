package reports

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/google/go-github/v57/github"
	"github.com/joshdk/go-junit"
	"golang.org/x/exp/slog"
)

var SDKs = []SDKMeta{
	NewSDKMeta(
		"web5-js",
		"TBD54566975/web5-js",
		"junit-results",
		"test-vectors",
		"web5",
		regexp.MustCompile(`Web5TestVectors(\w+)`),
		regexp.MustCompile(`.* Web5TestVectors\w+ (\w+)`),
	),
	NewSDKMeta(
		"web5-kt",
		"TBD54566975/web5-kt",
		"tests-report-junit",
		"test-vectors",
		"web5",
		regexp.MustCompile(`Web5TestVectors(\w+)`),
		regexp.MustCompile(`(\w+)`),
	),
	NewSDKMeta(
		"web5-swift",
		"TBD54566975/web5-swift",
		"test-results",
		"test-vectors",
		"web5",
		regexp.MustCompile(`Web5TestVectors(\w+)`),
		regexp.MustCompile(`test_(\w+)`),
	),
	NewSDKMeta(
		"web5-rs",
		"TBD54566975/web5-rs",
		"rust-test-results",
		"tbdex-test-vectors",
		"web5",
		regexp.MustCompile(`::(\w+)::(\w+)::(\w+)`),
		regexp.MustCompile(`::(\w+)$`),
	),
	NewSDKMeta(
		"web5-core-kt",
		"TBD54566975/web5-rs",
		"kotlin-test-results",
		"test-vectors",
		"web5",
		regexp.MustCompile(`Web5TestVectorsTest\$Web5TestVectors(\w+)`),
		regexp.MustCompile(`(\w+)`),
	),
	NewSDKMeta(
		"tbdex-js",
		"TBD54566975/tbdex-js",
		"junit-results",
		"tbdex-test-vectors",
		"tbdex",
		regexp.MustCompile(`TbdexTestVectors(\w+)`),
		regexp.MustCompile(`TbdexTestVectors(\w+) (\w+)`),
	),
	NewSDKMeta(
		"tbdex-kt",
		"TBD54566975/tbdex-kt",
		"tests-report-junit",
		"tbdex-test-vectors",
		"tbdex",
		regexp.MustCompile(`tbdex\.sdk\.\w+.TbdexTestVectors(\w+)`),
		regexp.MustCompile(`(\w+)`),
	),
	NewSDKMeta(
		"tbdex-go",
		"TBD54566975/tbdex-go",
		"go-test-results",
		"tbdex-test-vectors",
		"tbdex",
		regexp.MustCompile(`TbdexTestVectors(\w+)`),
		regexp.MustCompile(`TestAllParsers/(\w+)`),
	),
	NewSDKMeta(
		"tbdex-rs",
		"TBD54566975/tbdex-rs",
		"rust-test-results",
		"tbdex-test-vectors",
		"tbdex",
		regexp.MustCompile(`TbdexTestVectors(\w+)Test`),
		regexp.MustCompile(`::(\w+)$`),
	),
	NewSDKMeta(
		"tbdex-core-kt",
		"TBD54566975/tbdex-rs",
		"kotlin-test-results",
		"tbdex-test-vectors",
		"tbdex",
		regexp.MustCompile(`tbdex\.sdk\.\w+\.TbdexTestVectors(\w+)Test`),
		regexp.MustCompile(`(\w+)`),
	),
}

func GetAllReports() ([]Report, error) {
	ctx := context.Background()

	err := CheckSubmoduleStatus(context.Background())
	if err != nil {
		fmt.Println("Error checking submodule status: %v", err)
	}

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

		var report Report
		if sdk.Name == "web5-rs" {
			report, err = sdk.buildReportWeb5Rs(web5TestVectorSuites)
		} else {
			report, err = sdk.buildReport(web5TestVectorSuites)
		}

		//report.

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
	var allWeb5SpecCommits []*github.RepositoryCommit
	var allTbdexCommits []*github.RepositoryCommit

	// Fetch commits for web5-spec
	web5SpecOpt := &github.CommitsListOptions{
		SHA: "main",
		ListOptions: github.ListOptions{
			PerPage: 100,
		},
	}

	for {
		commits, resp, err := gh.Repositories.ListCommits(ctx, "TBD54566975", "web5-spec", web5SpecOpt)
		if err != nil {
			log.Fatalf("Error listing web5-spec commits: %v", err)
		}
		allWeb5SpecCommits = append(allWeb5SpecCommits, commits...)
		if resp.NextPage == 0 {
			break
		}
		web5SpecOpt.Page = resp.NextPage
	}

	// Fetch commits for tbdex
	tbdexOpt := &github.CommitsListOptions{
		SHA: "main",
		ListOptions: github.ListOptions{
			PerPage: 100,
		},
	}

	for {
		commits, resp, err := gh.Repositories.ListCommits(ctx, "TBD54566975", "tbdex", tbdexOpt)
		if err != nil {
			log.Fatalf("Error listing tbdex commits: %v", err)
		}
		allTbdexCommits = append(allTbdexCommits, commits...)
		if resp.NextPage == 0 {
			break
		}
		tbdexOpt.Page = resp.NextPage
	}

	// Iterate using index to modify the original SDKMeta in the slice
	for i := range SDKs {
		sdk := &SDKs[i]

		// default values
		sdk.SubmoduleCommit = "-"
		sdk.SubmoduleCommitBehind = -1

		owner, repo, _ := strings.Cut(sdk.Repo, "/")

		// Determine the submodule path based on the SDK type
		var submodulePath string
		var allCommits []*github.RepositoryCommit

		if sdk.Type == "tbdex" {
			submodulePath = "tbdex"
			allCommits = allTbdexCommits
		} else {
			submodulePath = "web5-spec"
			allCommits = allWeb5SpecCommits
		}

		// Get the current submodule commit for the SDK repo
		submoduleFileContent, _, _, err := gh.Repositories.GetContents(ctx, owner, repo, submodulePath, nil)
		if err != nil || submoduleFileContent == nil || submoduleFileContent.SHA == nil {
			fmt.Printf("error getting submodule content for %s: %v.. continuing", sdk.Repo, err)
			continue
		}

		submoduleCommitSHA := *submoduleFileContent.SHA
		fmt.Printf("Current submodule commit for %s in %s: %s \n", submodulePath, sdk.Repo, submoduleCommitSHA)
		sdk.SubmoduleCommit = submoduleCommitSHA

		// Check how far behind the submodule commit is from the allCommits
		counter := 0
		found := false
		for _, commit := range allCommits {
			if *commit.SHA == submoduleCommitSHA {
				fmt.Printf("%s is behind by %d commits in %s \n", sdk.Repo, counter, submodulePath)
				sdk.SubmoduleCommitBehind = counter
				found = true
				break
			}
			counter++
		}

		if !found {
			fmt.Printf("%s cannot determine how far behind with hash: %s in %s\n", sdk.Repo, submoduleCommitSHA, submodulePath)
		}
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
