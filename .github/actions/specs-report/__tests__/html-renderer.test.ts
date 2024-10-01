import { generateConformanceDataHTML } from '../src/html-renderer'
import { ConformanceData } from '../src/spec-release'

import exampleConformanceDataSimple from './assets/example-spec-conformance-web5-simple.json'
import exampleConformanceDataComplex from './assets/example-spec-conformance-web5-complex.json'

describe('generateConformanceDataHTML', () => {
  it('should generate correct HTML table from conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataSimple as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    // Check for table structure
    expect(result).toContain('<table>')
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')

    // Check for header row
    expect(result).toContain('<th>Specification</th>')
    expect(result).toContain('<th>web5-rs</th>')
    expect(result).toContain('<th>web5-core-kt</th>')

    // Check for specification details
    expect(result).toContain('v0.3.1-alpha</a>')
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-spec/releases/tag/v0.3.1-alpha'
    )
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-spec/tree/v0.3.1-alpha/test-vectors'
    )

    // Check for SDK details
    expect(result).toContain('v4.0.0</a>')
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0'
    )
  })

  it('should generate the exact HTML table from Simple conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataSimple as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)
    console.info(result)

    const expectedHTML = `
<!-- web5-spec CONFORMANCE TABLE: BEGIN -->
<table>
    <thead>
        <tr>
            <th>Specification</th>
            
                <th>web5-core-kt</th>
            
                <th>web5-rs</th>
            
        </tr>
    </thead>
    <tbody>
        
            <tr>
                <!-- Specification Column -->
                <td>
                    <a href="https://github.com/TBD54566975/web5-spec/releases/tag/v0.3.1-alpha">v0.3.1-alpha</a><br/>
                    <a href="https://github.com/TBD54566975/web5-spec/tree/v0.3.1-alpha/test-vectors">(tests)</a>
                </td>

                <!-- SDK Columns -->
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a></td>
                    
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a></td>
                    
                
            </tr>
        
    </tbody>
</table>
<!-- web5-spec CONFORMANCE TABLE: END -->
`

    expect(result).toBe(expectedHTML)
  })

  it('should generate the exact HTML table from Complex conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataComplex as any

    const result = generateConformanceDataHTML('web5-spec', conformanceData)
    console.info(result)

    const expectedHTML = `
<!-- web5-spec CONFORMANCE TABLE: BEGIN -->
<table>
    <thead>
        <tr>
            <th>Specification</th>
            
                <th>web5-core-kt</th>
            
                <th>web5-kt</th>
            
                <th>web5-rs</th>
            
        </tr>
    </thead>
    <tbody>
        
            <tr>
                <!-- Specification Column -->
                <td>
                    <a href="https://github.com/TBD54566975/web5-spec/releases/tag/v0.4-alpha">v0.4-alpha</a><br/>
                    <a href="https://github.com/TBD54566975/web5-spec/tree/v0.4-alpha/test-vectors">(tests)</a>
                </td>

                <!-- SDK Columns -->
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a></td>
                    
                
                    
                    
                        <td>-</td>
                    
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a></td>
                    
                
            </tr>
        
            <tr>
                <!-- Specification Column -->
                <td>
                    <a href="https://github.com/TBD54566975/web5-spec/releases/tag/v0.3">v0.3</a><br/>
                    <a href="https://github.com/TBD54566975/web5-spec/tree/v0.3/test-vectors">(tests)</a>
                </td>

                <!-- SDK Columns -->
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v3.1.2">v3.1.2</a></td>
                    
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v2.9.113">v2.9.113</a></td>
                    
                
                    
                    
                        <td>-</td>
                    
                
            </tr>
        
            <tr>
                <!-- Specification Column -->
                <td>
                    <a href="https://github.com/TBD54566975/web5-spec/releases/tag/v0.2">v0.2</a><br/>
                    <a href="https://github.com/TBD54566975/web5-spec/tree/v0.2/test-vectors">(tests)</a>
                </td>

                <!-- SDK Columns -->
                
                    
                    
                        <td>-</td>
                    
                
                    
                    
                        <td><a href="https://github.com/TBD54566975/web5-rs/releases/tag/v2.0.1">v2.0.1</a></td>
                    
                
                    
                    
                        <td>-</td>
                    
                
            </tr>
        
    </tbody>
</table>
<!-- web5-spec CONFORMANCE TABLE: END -->
`

    expect(result).toBe(expectedHTML)
  })

  it('should generate correct HTML table with missing SDKs versions', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataComplex as any

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    // Check for header row
    expect(result).toContain('<th>Specification</th>')
    expect(result).toContain('<th>web5-rs</th>')
    expect(result).toContain('<th>web5-core-kt</th>')

    // Check for SDK details
    expect(result).toContain('v3.1.2</a>')

    // Check for missing SDK data
    expect(result).toContain('<td>-</td>')
  })

  it('should handle empty conformance data', () => {
    const emptyConformanceData: ConformanceData = { specReleases: [] }

    const result = generateConformanceDataHTML(
      'web5-spec',
      emptyConformanceData
    )

    expect(result).toContain('<table>')
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')
    expect(result).not.toContain('Test Vectors</a>')
  })

  it('should handle conformance data with no SDKs', () => {
    const noSdksConformanceData: ConformanceData = {
      specReleases: [
        {
          version: 'v1.0.0',
          releaseLink: 'https://example.com/release',
          testVectors: {
            srcLink: 'https://example.com/test-vectors',
            cases: {}
          },
          sdks: {}
        }
      ]
    }

    const result = generateConformanceDataHTML(
      'web5-spec',
      noSdksConformanceData
    )

    expect(result).toContain('<table>')
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')
    expect(result).toContain('<tr>')
    expect(result).toContain('v1.0.0</a>')
    expect(result).not.toContain('<th>web5-rs</th>')
    expect(result).not.toContain('<th>web5-core-kt</th>')
  })
})
