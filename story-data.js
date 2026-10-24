/* Source-linked project content. Molecular files and notebook permissions are unchanged. */
window.RESEARCH_STORY = {
  "project": "heme",
  "title": "How it works",
  "subtitle": "",
  "durationSeconds": 35,
  "scaleNote": "The molecular model shows structure. The reaction scenes explain chemistry; their motion, colour intensity and timing are illustrative.",
  "scenes": [
    {
      "id": "sample",
      "title": "A sample outside the body",
      "question": "Where does a chemical measurement begin?",
      "caption": "A blood sample is prepared for an assay outside the body. Serum contains proteins, salts and many molecules. Before color can mean concentration, the test needs a target-specific recognition step, a reporter and controls for the sample background.",
      "scale": "Person to assay chamber · cm to mm",
      "breadcrumb": [
        "Person",
        "Sample",
        "Assay chamber"
      ],
      "durationSeconds": 7,
      "evidenceType": "Assay illustration",
      "evidenceNote": "The serum scene is application context. No patient sample has been measured with this four-helix bundle here.",
      "deep": "The catalyst is a possible laboratory reagent in this story. It is not injected into the person. Published methotrexate and cholesterol sensing studies motivate serum examples, but each used its own recognition system and reporter material. Their results cannot be transferred to the PEG2 assembly.",
      "labels": [
        "Prepared serum sample",
        "Proteins + salts",
        "Target molecules",
        "Possible interferents"
      ],
      "sources": [
        {
          "title": "Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36965245/"
        },
        {
          "title": "Cholesterol oxidase and hemin-G-quadruplex ABTS assay",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22483213/"
        }
      ],
      "onstageCaption": "The measurement happens outside the body. A prepared sample needs target recognition, reporting chemistry and background controls."
    },
    {
      "id": "recognition",
      "title": "Recognition comes before reporting",
      "question": "What makes the signal belong to a particular target?",
      "caption": "A heme catalyst is a reporter, not a universal target detector. Glucose oxidase and cholesterol oxidase can generate peroxide from their substrates. A published methotrexate assay instead used aptamer recognition and DNA amplification to control a hemin-DNAzyme reporter.",
      "scale": "Recognition chemistry · nm",
      "breadcrumb": [
        "Sample",
        "Recognition",
        "Reporter input"
      ],
      "durationSeconds": 7,
      "evidenceType": "Published assay examples",
      "evidenceNote": "These are distinct published architectures. None establishes target detection by the displayed PEG2 model.",
      "deep": "Recognition identifies the target; reporting creates a measurable output. Choose a route to see which chemical step connects the target to the reporter. The enzymes and aptamer shown are explanatory shapes, not their experimental atomic structures.",
      "labels": [
        "Target recognition",
        "Reporter chemistry",
        "Separate functions"
      ],
      "sources": [
        {
          "title": "SP1-hemin coupled glucose-biosensing study",
          "url": "https://doi.org/10.1002/smsc.202400025"
        },
        {
          "title": "Cholesterol oxidase and hemin-G-quadruplex ABTS assay",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22483213/"
        },
        {
          "title": "Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36965245/"
        }
      ],
      "variants": {
        "glucose": {
          "question": "How can glucose create a peroxide input?",
          "caption": "Glucose oxidase reacts with glucose and oxygen, producing hydrogen peroxide. A validated peroxide reporter could turn that output into color. The recognition belongs to glucose oxidase; changing the heme reporter does not automatically improve glucose selectivity.",
          "evidenceType": "Published cascade example",
          "evidenceNote": "GOx-to-peroxide coupling has precedent; this PEG2 bundle has no glucose calibration.",
          "deep": "A different SP1-hemin system has been used in an optical glucose platform. A bundle-based version would need peroxide validation first, then full coupled-assay calibration and interference comparisons in the intended sample.",
          "labels": [
            "Glucose + oxygen",
            "Glucose oxidase",
            "Hydrogen peroxide",
            "Reporter"
          ],
          "sources": [
            {
              "title": "SP1-hemin coupled glucose-biosensing study",
              "url": "https://doi.org/10.1002/smsc.202400025"
            }
          ],
          "onstageCaption": "Glucose oxidase generates peroxide from glucose and oxygen. The reporter reads peroxide; the enzyme provides glucose recognition."
        },
        "cholesterol": {
          "question": "What changes when the target is cholesterol?",
          "caption": "Cholesterol oxidase generates peroxide during cholesterol oxidation. Published hemin-G-quadruplex assays connect that peroxide to ABTS oxidation. The recognition enzyme changes with the target; the peroxide-reporting question remains separate.",
          "evidenceType": "Published cascade example",
          "evidenceNote": "The cited assay used a DNAzyme, not this nucleopeptide bundle.",
          "deep": "The published cholesterol assay combined cholesterol oxidase with hemin-G-quadruplex catalysis and tested serum samples. Its performance belongs to that material and preparation. A new reporter requires its own standards, blank correction and sample-interference study.",
          "labels": [
            "Cholesterol + oxygen",
            "Cholesterol oxidase",
            "Hydrogen peroxide",
            "Reporter"
          ],
          "sources": [
            {
              "title": "Cholesterol oxidase and hemin-G-quadruplex ABTS assay",
              "url": "https://pubmed.ncbi.nlm.nih.gov/22483213/"
            }
          ],
          "onstageCaption": "Cholesterol oxidase generates peroxide. Published hemin-DNAzyme assays report it through ABTS; this bundle still needs its own validation."
        },
        "methotrexate": {
          "question": "How could the same medicine be measured in a sample?",
          "caption": "A published methotrexate aptamer assay used recognition and DNA amplification to generate hemin-G-quadruplex reporters. It measured diluted human serum. Methotrexate does not generate the peroxide input in this scheme, and the PEG2 bundle has not demonstrated methotrexate detection.",
          "evidenceType": "Published medication assay",
          "evidenceNote": "An aptamer/amplification/DNAzyme precedent, not a demonstrated application of this bundle.",
          "deep": "The reported route couples methotrexate binding to polymerization/nicking amplification, G-quadruplex production and hemin-DNAzyme reporting in diluted human serum. Its chromogenic system is TMB/H2O2, not the green ABTS reaction being considered for the PEG2 bundle. Methotrexate is the recognition target; it does not generate the peroxide input. The paper does not establish that the four-helix assembly can replace its reporter or recognition system.",
          "labels": [
            "Methotrexate",
            "Specific aptamer",
            "DNA amplification",
            "Hemin-DNAzyme reporter"
          ],
          "sources": [
            {
              "title": "Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum",
              "url": "https://pubmed.ncbi.nlm.nih.gov/36965245/"
            }
          ],
          "onstageCaption": "A published methotrexate aptamer assay amplified hemin-DNAzyme reporting. Methotrexate did not generate peroxide, and this PEG2 bundle was not the reporter."
        }
      },
      "onstageCaption": "Recognition identifies the target. The heme reporter creates a signal. Choose a route to see the chemistry connecting them."
    },
    {
      "id": "bundle",
      "title": "The bundle",
      "question": "What is being built?",
      "caption": "The design brings four guanosine-PEG2-capped helices around hemin. The peptide provides the pocket; the cap is intended to help organize the assembly.",
      "scale": "Bundle · nm",
      "breadcrumb": [
        "Assay",
        "Reporter",
        "Four-helix model"
      ],
      "durationSeconds": 7,
      "evidenceType": "Project structural model",
      "evidenceNote": "The linked explorer contains the original 1,213-atom PEG2 coordinates, preserved separately from the simulation model.",
      "deep": "The opening model, early summer constructions, the as-run simulation and the corrected reference are distinct versions. The four chains also do not share a single peptide sequence. Historical sample characterization should not be assigned to this model without reconciling the construct and sequence records.",
      "labels": [
        "Peptide helices",
        "Guanosine-PEG2 caps",
        "Hemin",
        "Histidines"
      ],
      "modelSelection": {
        "mode": "secondary",
        "component": "all"
      },
      "sources": [
        {
          "title": "GSPEG2 project overview and analysis"
        },
        {
          "title": "Summer molecular construction report"
        }
      ],
      "variants": {
        "methotrexate": {
          "caption": "The published methotrexate sensor uses a hemin-DNAzyme reporter. This four-helix PEG2 bundle is a separate material to investigate. Its structure does not establish that it can replace that reporter or measure the medication.",
          "evidenceType": "Separate research model",
          "evidenceNote": "The cited medication sensor uses an aptamer, DNA amplification and a hemin-DNAzyme/TMB reporter. It did not test the PEG2 bundle or its ABTS assay.",
          "sources": [
            {
              "title": "GSPEG2 project overview and analysis"
            },
            {
              "title": "Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum",
              "url": "https://pubmed.ncbi.nlm.nih.gov/36965245/"
            }
          ],
          "onstageCaption": "The published methotrexate assay used a DNAzyme. This four-helix bundle is a separate reporter design, without demonstrated medication detection."
        }
      },
      "onstageCaption": "Four capped peptide chains surround hemin in the model. The helices form the pocket. The guanosine caps are intended to help the chains assemble."
    },
    {
      "id": "iron",
      "title": "The heme pocket",
      "question": "Can it hold hemin and keep the iron site accessible?",
      "caption": "Histidine side chains point toward hemin’s iron. The intended pocket needs to retain hemin while allowing peroxide to reach a reactive site.",
      "scale": "Iron coordination · Å",
      "breadcrumb": [
        "Bundle",
        "Hemin",
        "Iron site"
      ],
      "durationSeconds": 7,
      "evidenceType": "Model and design question",
      "evidenceNote": "The displayed Fe-His bonds are specified topology connections. Their persistence is not a measured binding affinity.",
      "deep": "The C45 precedent used a different, monohistidine-ligated heme design with demonstrated peroxidase activity. It motivates testing access and coordination here. It does not prove that the displayed bis-histidine pocket has the same mechanism, turnover or stability.",
      "labels": [
        "Histidine",
        "Porphyrin ring",
        "Iron",
        "Access to the heme site"
      ],
      "modelSelection": {
        "mode": "atomic",
        "component": "heme"
      },
      "sources": [
        {
          "title": "GSPEG2 project overview and analysis"
        },
        {
          "title": "C45: a designed heme peroxidase",
          "url": "https://www.nature.com/articles/s41467-017-00541-4"
        }
      ],
      "onstageCaption": "The pocket needs to hold hemin securely and keep a useful reaction site accessible to peroxide."
    },
    {
      "id": "catalysis",
      "title": "Peroxide and ABTS",
      "question": "How would the catalyst produce a signal?",
      "caption": "In the general heme-peroxidase cycle, peroxide creates an oxidized catalytic intermediate. ABTS supplies electrons as the catalyst returns toward its resting state, producing green oxidized ABTS.",
      "scale": "Reaction chemistry · Å",
      "breadcrumb": [
        "Assay",
        "Heme site",
        "Reporter reaction"
      ],
      "durationSeconds": 7,
      "evidenceType": "Mechanism illustration",
      "evidenceNote": "Bond changes and intermediates are explanatory. Fixed-topology simulation playback does not establish this catalytic cycle.",
      "deep": [
        "A teaching cycle can show ferric heme, Compound I and Compound II, followed by return to ferric heme through two one-electron reporter oxidations. The exact intermediates and reactive access in this bundle remain unmeasured. C45 demonstrates useful designed-heme chemistry in a different scaffold.",
        "The heme geometry is extracted from the source PEG2 model: 73 heme atoms from the full 1,213-atom file. Peroxide, oxo and reporter actors are separate mechanism illustrations. Their motion is not an observed catalytic reaction, and the source atomic coordinates are unchanged."
      ],
      "labels": [
        "H₂O₂ input",
        "Oxidized heme intermediate",
        "ABTS oxidation",
        "Catalyst returns"
      ],
      "sources": [
        {
          "title": "C45: a designed heme peroxidase",
          "url": "https://www.nature.com/articles/s41467-017-00541-4"
        },
        {
          "title": "GSPEG2 project overview and analysis"
        }
      ],
      "onstageCaption": "Peroxide activates a heme-peroxidase cycle. Oxidizing ABTS produces the green reporter product; experiments will test whether this bundle supports that chemistry."
    },
    {
      "id": "signal",
      "title": "The optical signal",
      "question": "What does the color tell us?",
      "caption": "Many oxidized ABTS molecules create a green signal that can be followed by absorbance. Compare the response with reagent blanks and free hemin before attributing it to the assembly.",
      "scale": "Molecules to solution · nm to mm",
      "breadcrumb": [
        "Reporter molecules",
        "Bulk color",
        "Optical readout"
      ],
      "durationSeconds": 7,
      "evidenceType": "Signal illustration",
      "evidenceNote": "Color and particle numbers are illustrative. No bundle activity or sensitivity is inferred from this scene.",
      "deep": "A green signal alone does not identify what produced it. Hemin, the peptide material, the target-recognition system and sample components can affect the readout. Separate reagent controls and a peroxide-dependence check are needed before interpreting a change as useful reporting.",
      "labels": [
        "ABTS",
        "Oxidized ABTS",
        "Green solution",
        "Absorbance"
      ],
      "sources": [
        {
          "title": "C45: a designed heme peroxidase",
          "url": "https://www.nature.com/articles/s41467-017-00541-4"
        },
        {
          "title": "Smith-Carpenter Lab guanosine-nucleopeptide peroxidase study",
          "url": "https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J"
        },
        {
          "title": "GSPEG2 project overview and analysis"
        }
      ],
      "onstageCaption": "Many oxidized ABTS molecules create a green optical signal. Blanks and free-hemin controls identify what contributes to the response."
    },
    {
      "id": "calibration",
      "title": "Calibration",
      "question": "When does color become a measurement?",
      "caption": "Measure known peroxide standards and a blank under the same conditions. Use the corrected response to calibrate an unknown, then test repeatability and sample interference.",
      "scale": "Assay chamber to instrument · mm to cm",
      "breadcrumb": [
        "Blank",
        "Standards",
        "Unknown",
        "Calibration"
      ],
      "durationSeconds": 7,
      "evidenceType": "Measurement design",
      "evidenceNote": "The standards and plot are illustrative, without invented concentrations or performance data.",
      "deep": "Establish peroxide reporting first. A glucose or cholesterol application then needs calibration of the complete coupled assay. A medication assay needs a validated recognition and reporting architecture. Dilution and complex sample backgrounds must be evaluated rather than assumed harmless.",
      "labels": [
        "Blank",
        "Known standards",
        "Unknown",
        "Corrected response"
      ],
      "sources": [
        {
          "title": "GSPEG2 project overview and analysis"
        },
        {
          "title": "SP1-hemin coupled glucose-biosensing study",
          "url": "https://doi.org/10.1002/smsc.202400025"
        },
        {
          "title": "Cholesterol oxidase and hemin-G-quadruplex ABTS assay",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22483213/"
        },
        {
          "title": "Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36965245/"
        }
      ],
      "onstageCaption": "A blank and known standards connect the optical response to concentration. Repeatability and interference determine whether the assay is useful."
    },
    {
      "id": "comparison",
      "title": "What would make this material useful?",
      "question": "Which experiment could show an advantage?",
      "caption": "Compare free hemin, peptide alone, peptide plus hemin and an established peroxidase. Measure activity, cofactor retention, storage behavior and preparation-to-preparation variation. A useful difference must be demonstrated under matched conditions, not inferred from the model’s appearance.",
      "scale": "Materials to assay performance",
      "breadcrumb": [
        "Design",
        "Controlled comparison",
        "Measured result"
      ],
      "durationSeconds": 7,
      "evidenceType": "Research next steps",
      "evidenceNote": "Related lab nanofibers oxidized ABTS with and without hemin; they differ from the displayed four-helix design.",
      "deep": "The Smith-Carpenter Lab’s published guanosine-nucleopeptide work makes the peptide-only control especially important. Its nanofiber architecture and corrected chemical drawings must be kept distinct from this PEG2 bundle. Better cofactor retention, useful lifetime, surface attachment or sample compatibility are testable aims, not established benefits.",
      "labels": [
        "Free hemin",
        "Peptide only",
        "Peptide + hemin",
        "Reference peroxidase"
      ],
      "sources": [
        {
          "title": "Smith-Carpenter Lab guanosine-nucleopeptide peroxidase study",
          "url": "https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J"
        },
        {
          "title": "Correction to the guanosine-nucleopeptide article",
          "url": "https://pubs.rsc.org/en/content/articlepdf/2026/cc/d6cc90031c"
        },
        {
          "title": "GSPEG2 project overview and analysis"
        }
      ],
      "onstageCaption": "Compare hemin, peptide alone, peptide plus hemin and a reference enzyme. Any advantage needs a matched experimental measurement."
    }
  ],
  "mainSceneIds": [
    "bundle",
    "iron",
    "catalysis",
    "signal",
    "calibration"
  ]
};
