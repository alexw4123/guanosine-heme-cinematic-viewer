/* Source-linked project content. Molecular files and notebook permissions are unchanged. */
window.RESEARCH_APPLICATIONS = {
  "version": "2026-10-24-source-audit-v5",
  "heme": {
    "title": "Measuring peroxide",
    "intro": "Start with a peroxide assay. Compare free hemin, peptide alone, peptide plus hemin and an established peroxidase under matched conditions.",
    "existing": {
      "title": "Why compare with HRP?",
      "text": "Hemin can support reporter oxidation on its own. Horseradish peroxidase, or HRP, provides an established enzyme comparison. Those controls show whether the assembly adds a useful effect.",
      "sources": [
        {
          "title": "Designed C45 peroxidase · primary study",
          "url": "https://www.nature.com/articles/s41467-017-00541-4"
        }
      ]
    },
    "design": {
      "title": "Variables we can test",
      "text": "Change the cap, linker, sequence or histidine position in matched constructs. Measure which changes affect activity, cofactor retention and storage behavior.",
      "sources": [
        {
          "title": "Project overview and analysis"
        }
      ]
    },
    "cases": [
      {
        "id": "peroxide",
        "label": "Peroxide assay",
        "title": "Measure peroxide in a cuvette or microplate",
        "text": "Start with known peroxide standards in buffer. Add the hemin assembly and ABTS, follow the green oxidation signal by absorbance, and compare the corrected response with the standards.",
        "path": [
          [
            "Peroxide standards",
            "Known concentrations and a blank."
          ],
          [
            "Assembly + ABTS",
            "A peroxide-dependent reporter reaction."
          ],
          [
            "Green optical signal",
            "Measure absorbance or its initial rate."
          ],
          [
            "Calibration",
            "Relate the corrected response to peroxide."
          ]
        ],
        "criteria": "A useful result is a reproducible calibration over a stated range, with acceptable blanks, recovery and sample interference. No such calibration has been established for this bundle."
      },
      {
        "id": "glucose",
        "label": "Glucose-coupled assay",
        "title": "Use glucose oxidase to connect glucose to peroxide",
        "text": "Glucose oxidase, or GOx, produces peroxide when it oxidizes glucose. A validated bundle could then report that peroxide through ABTS oxidation. GOx provides recognition; the catalyst provides the reporter reaction.",
        "path": [
          [
            "Glucose + GOx",
            "GOx generates hydrogen peroxide."
          ],
          [
            "Peroxide reporter",
            "Validated bundle + ABTS."
          ],
          [
            "Optical measurement",
            "Follow the colored reporter product."
          ],
          [
            "Glucose standards",
            "Calibrate the complete coupled assay."
          ]
        ],
        "criteria": "Validate peroxide reporting first. Then calibrate the complete coupled assay against glucose standards and check recovery, background and sample interference."
      },
      {
        "id": "screening",
        "label": "Drug-research assay",
        "title": "A laboratory reporter during compound screening",
        "text": "A possible pharmaceutical connection is an assay reagent. Some screening compounds generate peroxide and can produce misleading results. A validated peroxide reporter could help identify that chemistry in a cell-free screen.",
        "path": [
          [
            "Compound + assay buffer",
            "Use defined screening conditions."
          ],
          [
            "Peroxide reporter",
            "Compare with reporter-only controls."
          ],
          [
            "Signal and interference",
            "Check color, quenching and direct oxidation."
          ],
          [
            "Orthogonal check",
            "Confirm peroxide with another method."
          ]
        ],
        "criteria": "An HRP/phenol-red screening assay is a published precedent. A bundle/ABTS version needs its own compatibility and interference study, including a catalase-treated control to check peroxide dependence. This use does not require administering the catalyst as a drug."
      }
    ],
    "comparisons": [
      {
        "goal": "A benefit from assembly",
        "existing": "Free hemin at matched hemin concentration.",
        "test": "Compare blank-corrected ABTS rates and useful peroxide calibration range, with assembly-only and no-peroxide controls.",
        "meaning": "The assembly should add a reproducible benefit beyond free hemin under the same conditions."
      },
      {
        "goal": "A useful reporter alternative",
        "existing": "An HRP reference under the intended assay conditions.",
        "test": "Compare response time, calibration range, detection limit, storage stability and run-to-run variation.",
        "meaning": "Report the metric improved and the tradeoffs. “Better” requires a specified use and a measured comparison."
      },
      {
        "goal": "A useful glucose measurement",
        "existing": "An independent glucose reference method.",
        "test": "Measure agreement, recovery and interference in the intended sample, after validating GOx coupling.",
        "meaning": "Changing the peroxide reporter alone does not establish glucose selectivity or clinical accuracy."
      }
    ],
    "evidence": [
      {
        "title": "An earlier glucose-coupled assay",
        "text": "A different SP1–hemin assembly was studied with GOx, peroxide and ABTS. It supports this application pathway, while its measured performance belongs to that other material.",
        "url": "https://doi.org/10.1002/smsc.202400025"
      },
      {
        "title": "Peroxide during compound screening",
        "text": "A published HRP/phenol-red method detected peroxide generated by compounds in screening conditions. It motivates testing a reporter reagent, with controls for compounds that affect the reporter itself.",
        "url": "https://pubmed.ncbi.nlm.nih.gov/18699726/"
      }
    ],
    "next": "Compare the hemin-containing assembly with free hemin, peptide-only and reagent controls. Establish peroxide calibration before adding a target-recognition enzyme or a compound-screening sample.",
    "limits": "Catalysis, sensing performance, storage stability and any advantage over HRP remain measurements to obtain for this bundle."
  }
};
