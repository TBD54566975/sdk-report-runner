import { ConformanceData } from './spec-release'

import ejs from 'ejs'

export const generateConformanceDataHTML = (
  specName: string,
  data: ConformanceData
) => {
  const specReleases = data.specReleases

  // Extract the list of unique SDK names
  let sdksSet = new Set()
  specReleases.forEach(spec => {
    Object.keys(spec.sdks || {}).forEach(sdkName => {
      sdksSet.add(sdkName)
    })
  })

  const sdksList = Array.from(sdksSet)
  sdksList.sort()
  //   <tr>
  //   <!-- Specification Column -->
  //   <td>
  //       <a href="https://github.com/TBD54566975/web5-spec/releases/tag/v0.3.1-alpha">v0.3.1-alpha</a>&nbsp; <a href="https://github.com/TBD54566975/web5-spec/tree/v0.3.1-alpha/test-vectors">(tests)</a>
  //   </td>

  //   <!-- SDK Columns -->

  //           <td>
  //               <a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a>
  //           </td>

  //           <td>
  //               <a href="https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0">v4.0.0</a>
  //           </td>

  // </tr>

  // Render the HTML table
  const HTML_TEMPLATE = `
<!-- <%= specName %> CONFORMANCE TABLE: BEGIN -->
<table>
    <thead>
        <tr>
            <th>Specification</th>
            <% sdksList.forEach(function(sdkName) { %>
                <th><%= sdkName %></th>
            <% }); %>
        </tr>
    </thead>
    <tbody>
        <% specReleases.forEach(function(spec) { %>
            <tr>
                <!-- Specification Column -->
                <td>
                    <a href="<%= spec.releaseLink %>"><%= spec.version %></a><br/>
                    <a href="<%= spec.testVectors.srcLink %>">(tests)</a>
                </td>

                <!-- SDK Columns -->
                <% sdksList.forEach(function(sdkName) { %>
                    <% var sdk = spec.sdks[sdkName]; %>
                    <% if (sdk) { %>
                        <td><a href="<%= sdk.releaseLink %>"><%= sdk.version %></a></td>
                    <% } else { %>
                        <td>-</td>
                    <% } %>
                <% }); %>
            </tr>
        <% }); %>
    </tbody>
</table>
<!-- <%= specName %> CONFORMANCE TABLE: END -->
`
  return ejs.render(HTML_TEMPLATE, {
    specName,
    specReleases,
    sdksList
  })
}
