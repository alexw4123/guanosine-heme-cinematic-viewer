/* Application rationale for this independent project. No measured advantage is implied. */
window.RESEARCH_APPLICATIONS = {
  "version": "2026-10-24-independent-3",
  "heme": {
    "title": "Measuring peroxide",
    "intro": "The first application is a benchtop optical assay. The question is whether organizing hemin with these nucleopeptides gives a useful peroxide reporter compared with free hemin and an established enzyme reporter.",
    "existing": {
      "title": "Why compare with HRP?",
      "text": "Peroxidase assays turn peroxide-dependent oxidation of a reporter into an optical signal. Horseradish peroxidase (HRP) is an established reporter enzyme. Free hemin is a necessary comparison because activity must be attributed to the assembly, not merely to hemin being present.",
      "sources": [
        {
          "title": "Designed C45 peroxidase · primary study",
          "url": "https://www.nature.com/articles/s41467-017-00541-4"
        }
      ]
    },
    "design": {
      "title": "Variables we can test",
      "text": "Cap organization, linker length, peptide sequence and histidine placement can be varied separately. These are design variables to test. They do not yet establish lower cost, longer storage life or higher activity.",
      "sources": [
        {
          "title": "Project overview and analysis",
          "url": "https://docs.google.com/document/d/1rmexqF9TSg2FgBzd4zzPp6pdkmKvPH0Gi1d7rOUiM1I/edit"
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
        "text": "Glucose oxidase (GOx) recognizes glucose and generates peroxide. A validated bundle could report that peroxide through ABTS oxidation. This changes the reporter-catalyst stage; it does not automatically improve glucose recognition.",
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
        "criteria": "First validate peroxide reporting. Then test the complete GOx-coupled assay against glucose standards, matrix blanks and an independent glucose measurement. A benchtop assay is the initial use; replacing a clinical glucose monitor is a different claim."
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
        "title": "The coupled pathway has a precedent",
        "text": "A different SP1–hemin assembly was studied with GOx, peroxide and ABTS. It supports this application pathway, while its measured performance belongs to that other material.",
        "url": "https://doi.org/10.1002/smsc.202400025"
      },
      {
        "title": "A specific drug-discovery connection",
        "text": "A published HRP/phenol-red method detected peroxide generated by compounds in screening conditions. It motivates testing a reporter reagent, with controls for compounds that affect the reporter itself.",
        "url": "https://pubmed.ncbi.nlm.nih.gov/18699726/"
      }
    ],
    "next": "Compare hemin-containing assemblies, free hemin and controls in the ABTS assay. Establish peroxide calibration before adding glucose oxidase or a compound-screening sample.",
    "limits": "Catalysis, sensing performance, storage stability and any advantage over HRP remain measurements to obtain for this bundle."
  }
};
