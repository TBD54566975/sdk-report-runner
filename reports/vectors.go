package reports

import (
	"io/fs"
	"path/filepath"
	"strings"
)

var knownVectors = readKnownVectors("../test-vectors")
var tbdexKnownVectors = readKnownTbdexVectors("../tbdex-test-vectors")

func readKnownVectors(dir string) map[string]map[string]bool {
	knownVectors := make(map[string]map[string]bool)
	err := filepath.Walk(dir, func(path string, info fs.FileInfo, err error) error {
		if !strings.HasSuffix(path, ".json") || strings.HasSuffix(path, ".schema.json") {
			return nil
		}

		feature, vector := parseVectorPath(strings.TrimPrefix(path, dir))
		if knownVectors[feature] == nil {
			knownVectors[feature] = make(map[string]bool)
		}
		knownVectors[feature][vector] = true

		return nil
	})

	if err != nil {
		panic(err)
	}

	return knownVectors
}

func parseVectorPath(path string) (feature string, vector string) {
	feature, vector = filepath.Split(path)
	vector = strings.TrimSuffix(vector, ".json")
	feature = strings.Trim(feature, "/")

	featureWords := []string{}
	for _, word := range strings.Split(feature, "_") {
		featureWords = append(featureWords, strings.Title(word)) // TODO: strings.Title is deprecated
	}

	feature = strings.Join(featureWords, "")

	return feature, vector
}

func readKnownTbdexVectors(dir string) map[string]map[string]bool {
	knownVectors := make(map[string]map[string]bool)
	err := filepath.Walk(dir, func(path string, info fs.FileInfo, err error) error {

		if strings.HasSuffix(path, "package-lock.json") || strings.HasSuffix(path, "package.json") {
			return nil
		}

		if !strings.HasSuffix(path, ".json") || strings.HasSuffix(path, ".schema.json") {
			return nil
		}

		feature, vector := parseTbdexVectorPath(strings.TrimPrefix(path, dir))
		if knownVectors[feature] == nil {
			knownVectors[feature] = make(map[string]bool)
		}
		knownVectors[feature][vector] = true

		return nil
	})

	if err != nil {
		panic(err)
	}

	return knownVectors
}

func parseTbdexVectorPath(path string) (feature string, vector string) {
	// Splitting the path into parts
	pathParts := strings.Split(path, "/")

	// Assuming the 'vector' is always the last part of the path
	vector = pathParts[len(pathParts)-1]
	vector = strings.TrimSuffix(vector, ".json")
	vector = strings.Replace(vector, "-", "_", -1)

	// Assuming the 'feature' is always the second last part of the path
	if len(pathParts) >= 3 {
		feature = pathParts[len(pathParts)-3]
	}

	featureWords := []string{}
	for _, word := range strings.Split(feature, "_") {
		featureWords = append(featureWords, strings.Title(word)) // TODO: strings.Title is deprecated
	}

	feature = strings.Join(featureWords, "")

	return feature, vector
}
