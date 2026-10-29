/* Preserved source-linked Heme research content. */
window.RESEARCH_CONTENT = {
  "version": "2026-10-24-source-audit-v5",
  "navigation": [
    "Overview",
    "Atomic structure",
    "How it works",
    "Research",
    "Sources"
  ],
  "sources": {
    "heme-overview": {
      "id": "heme-overview",
      "title": "GSPEG2 project overview and analysis",
      "access": "Existing document permissions retained"
    },
    "summer-report": {
      "id": "summer-report",
      "title": "Summer molecular construction report",
      "access": "Existing document permissions retained"
    },
    "historical-poster": {
      "id": "historical-poster",
      "title": "Historical Fairfield hemin-binding poster",
      "access": "Existing document permissions retained"
    },
    "notebook-background": {
      "id": "notebook-background",
      "title": "OneNote · Project Background",
      "access": "Existing notebook permissions retained"
    },
    "notebook-preliminary": {
      "id": "notebook-preliminary",
      "title": "OneNote · Preliminary data",
      "access": "Existing notebook permissions retained"
    },
    "notebook-goals": {
      "id": "notebook-goals",
      "title": "OneNote · 2026 to 2027 goals",
      "access": "Existing notebook permissions retained"
    },
    "c45": {
      "id": "c45",
      "title": "C45 de novo heme peroxidase research",
      "url": "https://www.nature.com/articles/s41467-017-00541-4",
      "access": "Public"
    },
    "fehp": {
      "id": "fehp",
      "title": "FeHP helical-bundle Ge–H insertion study",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12621988/",
      "access": "Public",
      "version_note": "Use the linked PMC version; do not infer final publication status from secondary metadata."
    },
    "gs-gkff": {
      "id": "gs-gkff",
      "title": "Guanosine-nucleopeptide nanofiber study",
      "url": "https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J",
      "access": "Public"
    },
    "gs-gkff-correction": {
      "id": "gs-gkff-correction",
      "title": "Correction to the guanosine-nucleopeptide article",
      "url": "https://pubs.rsc.org/en/content/articlepdf/2026/cc/d6cc90031c",
      "access": "Public",
      "version_note": "Use corrected chemical drawings; do not copy superseded stereochemistry."
    },
    "glucose-precedent": {
      "id": "glucose-precedent",
      "title": "Different hemin-peptide/glucose oxidase biosensor research",
      "url": "https://doi.org/10.1002/smsc.202400025",
      "access": "Public"
    }
  },
  "projects": {
    "heme": {
      "id": "heme",
      "shortName": "Heme bundle",
      "title": "Designing a Four-Helix Nucleopeptide Bundle Capable of Hemin Binding",
      "credit": "Christie Stevkovski, Alexander Wong, and Jillian Smith-Carpenter",
      "lab": "Smith-Carpenter Lab",
      "institution": "Fairfield University",
      "department": "Department of Chemistry and Biochemistry",
      "question": "Can this bundle bind hemin and help catalyze oxidation?",
      "overview": "This project asks whether short, guanosine-capped peptides can organize a hemin-binding bundle. The peptide helices form the scaffold, PEG2 joins each cap to its peptide, and histidines face the heme iron in the model.",
      "next": "Start with assembly, circular-dichroism and hemin-binding comparisons. Then compare ABTS oxidation in assemblies with and without hemin, alongside free-hemin and reagent controls.",
      "nextDetail": "Use the purchased gs-helix(A8H) material or separately documented future PEG3 constructs, with construct-specific preparation records. Assembly, hemin binding and oxidation must be measured separately.",
      "relevance": "A reproducible peroxide-dependent optical response could become a reporter in an assay. The first comparison is whether the assembly changes the response beyond free hemin.",
      "model": {
        "label": "Original PEG2 atomic model",
        "caption": "Original PEG2 molecular model · four constructed chains with hemin. Select a part to read its role while the full structure stays visible.",
        "atomCount": 1213,
        "bondCount": 1232,
        "file": "https://alexw4123.github.io/guanosine-heme-cinematic-viewer/assets/heme-original.pdb",
        "sha256": "e3eccb1cbe10a18a0bd633aaf076a7cd1fd2beeedccba0fd73a2a7695b238b4c"
      },
      "components": [
        {
          "id": "peptides",
          "label": "Peptide helices",
          "text": "Each modeled peptide has 15 amino acids. The helices provide the scaffold around hemin. Chains A/C and B/D have different sequences, which can be inspected below.",
          "sourceIds": [
            "heme-overview"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "guanosine",
          "label": "Guanosine + PEG2",
          "text": "The guanosine cap is the assembly idea; PEG2 connects it to the peptide. The existing trajectory did not establish a persistent guanine-quartet network.",
          "sourceIds": [
            "heme-overview",
            "notebook-preliminary"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            },
            {
              "id": "notebook-preliminary",
              "title": "OneNote · Preliminary data",
              "access": "Existing notebook permissions retained"
            }
          ]
        },
        {
          "id": "histidines",
          "label": "Histidines",
          "text": "Histidine at peptide position 8 points toward the iron on chains A and C. The displayed Fe-His connections were specified when the model was built.",
          "sourceIds": [
            "heme-overview"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "heme",
          "label": "Heme + Fe",
          "text": "Hemin is the iron-containing cofactor in the pocket. The design needs to hold it securely while keeping a useful reaction site accessible to peroxide.",
          "sourceIds": [
            "heme-overview",
            "c45"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            },
            {
              "id": "c45",
              "title": "C45 de novo heme peroxidase research",
              "url": "https://www.nature.com/articles/s41467-017-00541-4",
              "access": "Public"
            }
          ]
        }
      ],
      "sequences": [
        {
          "id": "model-ac",
          "label": "Original PEG2 · A / C",
          "sequence": "GEQALQEHEQLAQEL",
          "segments": [
            "PEPA",
            "PEPC"
          ],
          "interactive": true,
          "caption": "Exact source sequence. Histidine is peptide position 8; the source residue name is HSD. A separate GS2 cap/linker precedes these 15 peptide residues.",
          "sourceIds": [
            "heme-overview"
          ]
        },
        {
          "id": "model-bd",
          "label": "Original PEG2 · B / D",
          "sequence": "GEQLAQEAEQLLQEL",
          "segments": [
            "PEPB",
            "PEPD"
          ],
          "interactive": true,
          "caption": "Exact source sequence. Alanine is peptide position 8. Differences from the early sequence extend beyond this one position.",
          "sourceIds": [
            "heme-overview"
          ]
        },
        {
          "id": "historical-poster",
          "label": "Historical poster · printed structure",
          "sequence": "AEQLLQEAEQLLQEL–NH₂",
          "interactive": false,
          "caption": "The printed Ala8 structure differs from the A8H discussion in the abstract. A batch-specific synthesized sequence has not been reconciled.",
          "sourceIds": [
            "historical-poster"
          ]
        },
        {
          "id": "summer-entry",
          "label": "Summer construction · peptide entry",
          "sequence": "AEQLLQEHEQLLQEL",
          "interactive": false,
          "caption": "The early builder screenshot selects L stereochemistry, NH₂ at the N terminus and CO₂H at the C terminus. This construction step is separate from the final linked models.",
          "sourceIds": [
            "summer-report"
          ]
        },
        {
          "id": "as-run",
          "label": "Original simulation · as run",
          "sequence": "A/C: GEQALQEHEQLAQEL · B/D: GEQLAQEAEQLLQEL",
          "interactive": false,
          "caption": "The matched source PDB has these sequence types. Its trajectory remains separate from the later corrected dry reference.",
          "sourceIds": [
            "heme-overview"
          ]
        },
        {
          "id": "corrected-reference",
          "label": "Corrected PEG2 dry reference",
          "sequence": null,
          "interactive": false,
          "caption": "The later 2HH:2HA_AC reference is a separate static correction. No corrected production trajectory is shown.",
          "sourceIds": [
            "heme-overview"
          ]
        },
        {
          "id": "peg3",
          "label": "Planned PEG3 constructs",
          "sequence": "HH / HA construct series",
          "interactive": false,
          "caption": "Separate future constructs. Planned HH/HA feed ratios are 100:0, 75:25, 50:50, 25:75 and 0:100; those mixtures do not establish four-chain assembly stoichiometry.",
          "sourceIds": [
            "notebook-goals"
          ]
        }
      ],
      "priorWork": [
        {
          "title": "C45 · a designed heme peroxidase",
          "text": "A monohistidine-ligated designed heme protein supported ABTS oxidation. Its bis-His comparison had little activity in that assay. The lesson is to consider peroxide access as well as heme coordination.",
          "architecture": "Designed heme protein; distinct from guanosine-capped nucleopeptides",
          "reaction": "Peroxide-dependent ABTS oxidation",
          "sourceIds": [
            "c45"
          ],
          "sources": [
            {
              "id": "c45",
              "title": "C45 de novo heme peroxidase research",
              "url": "https://www.nature.com/articles/s41467-017-00541-4",
              "access": "Public"
            }
          ]
        },
        {
          "title": "FeHP · tune a helical-bundle pocket",
          "text": "This heme-binding helical-bundle lineage uses design and evolution to tune a pocket for Ge–H insertion. It shows what deliberate pocket optimization can achieve; it did not establish this bundle’s ABTS activity.",
          "architecture": "Designed/evolved helical-bundle protein",
          "reaction": "Enantioselective Ge–H insertion, a different reaction",
          "sourceIds": [
            "fehp"
          ],
          "sources": [
            {
              "id": "fehp",
              "title": "FeHP helical-bundle Ge–H insertion study",
              "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12621988/",
              "access": "Public",
              "version_note": "Use the linked PMC version; do not infer final publication status from secondary metadata."
            }
          ]
        },
        {
          "title": "Guanosine nucleopeptides · assembly and oxidation",
          "text": "The lab’s guanosine-nucleopeptide nanofibers promoted peroxide-dependent ABTS oxidation with and without added hemin. That result motivates a peptide-only control here. The nanofibers and this four-helix model are different structures.",
          "architecture": "Guanosine-nucleopeptide nanofibers",
          "reaction": "ABTS oxidation in peroxide-containing conditions, with comparisons involving hemin",
          "sourceIds": [
            "gs-gkff",
            "gs-gkff-correction"
          ],
          "sources": [
            {
              "id": "gs-gkff",
              "title": "Guanosine-nucleopeptide nanofiber study",
              "url": "https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J",
              "access": "Public"
            },
            {
              "id": "gs-gkff-correction",
              "title": "Correction to the guanosine-nucleopeptide article",
              "url": "https://pubs.rsc.org/en/content/articlepdf/2026/cc/d6cc90031c",
              "access": "Public",
              "version_note": "Use corrected chemical drawings; do not copy superseded stereochemistry."
            }
          ]
        }
      ],
      "steps": [
        {
          "id": "laboratory-foundation",
          "number": 1,
          "title": "Purification and characterization",
          "text": "The historical poster reports HPLC, ESI/MALDI-TOF and CD for earlier experimental constructs. These measurements concern those historical samples.",
          "sourceIds": [
            "historical-poster"
          ],
          "sources": [
            {
              "id": "historical-poster",
              "title": "Historical Fairfield hemin-binding poster",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "summer-construction",
          "number": 2,
          "title": "Build the molecular parts",
          "text": "The summer record follows peptide entry, guanosine-derived fragments, custom linking and a constructed four-chain starting arrangement.",
          "sourceIds": [
            "summer-report"
          ],
          "sources": [
            {
              "id": "summer-report",
              "title": "Summer molecular construction report",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "pocket-redesign",
          "number": 3,
          "title": "Redesign the linker and pocket",
          "text": "Early direct-link and all-His arrangements preceded the mixed His/Ala PEG2 model. The summer report records those different starting geometries.",
          "sourceIds": [
            "summer-report",
            "heme-overview"
          ],
          "sources": [
            {
              "id": "summer-report",
              "title": "Summer molecular construction report",
              "access": "Existing document permissions retained"
            },
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "simulation",
          "number": 4,
          "title": "Prepare and run the existing model",
          "text": "Dr. Macwan ran the existing NAMD simulation. The matched PSF, PDB and DCD contain 23,558 atoms; the five-second atomic replay samples saved coordinates from that run.",
          "sourceIds": [
            "heme-overview"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "analysis",
          "number": 5,
          "title": "Read the trajectory",
          "text": "The reported analysis found a compact peptide core with partial, uneven helix retention. It did not establish a persistent guanine-quartet network or central potassium site. The bonded Fe-His geometry remained coherent; that does not measure spontaneous hemin binding.",
          "sourceIds": [
            "heme-overview"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "corrected-reference",
          "number": 6,
          "title": "The corrected PEG2 reference",
          "text": "The later corrected 2HH:2HA_AC dry reference has not replaced the as-run trajectory. No corrected production run is shown.",
          "sourceIds": [
            "heme-overview"
          ],
          "sources": [
            {
              "id": "heme-overview",
              "title": "GSPEG2 project overview and analysis",
              "access": "Existing document permissions retained"
            }
          ]
        },
        {
          "id": "next-comparison",
          "number": 7,
          "title": "Compare assemblies in the laboratory",
          "text": "Measure assembly and hemin binding before interpreting ABTS oxidation. Planned PEG3 HH/HA mixtures are a separate construct series.",
          "sourceIds": [
            "notebook-goals",
            "notebook-preliminary"
          ],
          "sources": [
            {
              "id": "notebook-goals",
              "title": "OneNote · 2026 to 2027 goals",
              "access": "Existing notebook permissions retained"
            },
            {
              "id": "notebook-preliminary",
              "title": "OneNote · Preliminary data",
              "access": "Existing notebook permissions retained"
            }
          ]
        }
      ],
      "chemistry": {
        "title": "Peroxide, heme and the ABTS signal",
        "reaction": "H₂O₂ + reduced ABTS → oxidized ABTS signal",
        "steps": [
          "Peroxide reacts with an accessible ferric heme center.",
          "High-valent heme intermediates accept electrons from a reporter substrate.",
          "ABTS is oxidized to a colored radical-cation form.",
          "Measure absorbance against blanks and a known-peroxide calibration."
        ],
        "caption": "ABTS is a reporter: its oxidized form produces a green optical signal. The chapters explain the general heme-peroxidase chemistry that the bundle experiments will test.",
        "controls": [
          "Peptide + hemin + peroxide + ABTS",
          "Free hemin at matched hemin concentration",
          "Peptide without hemin",
          "No-peroxide and reagent blanks",
          "Sample-background and interference controls"
        ],
        "sources": [
          {
            "id": "c45",
            "title": "C45 de novo heme peroxidase research",
            "url": "https://www.nature.com/articles/s41467-017-00541-4",
            "access": "Public"
          },
          {
            "id": "notebook-preliminary",
            "title": "OneNote · Preliminary data",
            "access": "Existing notebook permissions retained"
          }
        ]
      },
      "applications": [
        {
          "title": "Where this catalyst could make a difference",
          "text": "The first application is a benchtop optical assay. The question is whether organizing hemin with these nucleopeptides gives a useful peroxide reporter compared with free hemin and an established enzyme reporter."
        },
        {
          "title": "What this design makes adjustable",
          "text": "Cap organization, linker length, peptide sequence and histidine placement can be varied separately. These are design variables to test. They do not yet establish lower cost, longer storage life or higher activity."
        }
      ],
      "experiments": [
        {
          "id": "heme-historical-cd-comparison",
          "title": "Historical helix assemblies · circular dichroism comparison",
          "summary": "Compare acetyl-capped and guanosine-capped helix assemblies, with and without added potassium.",
          "context": "Historical CD characterization · original poster",
          "construct": "ac-helix and gs-helix, each ±K⁺; separate from the displayed PEG2 computational model.",
          "sequence": "Poster prints AEQLLQEAEQLLQEL–NH₂; the A8H abstract and batch-specific sequence need reconciliation.",
          "fields": [
            {
              "label": "Instrument",
              "value": "Circular dichroism (CD)"
            },
            {
              "label": "Assembly concentration",
              "value": "50 µM"
            },
            {
              "label": "Buffer",
              "value": "10 mM Tris-HCl, pH 7.5"
            },
            {
              "label": "Potassium comparison",
              "value": "Without added KCl / 100 mM added KCl"
            },
            {
              "label": "Temperature",
              "value": "25 °C"
            }
          ],
          "procedure": [
            "Determine gs-helix stock concentration using a guanosine standard curve, as reported in the poster.",
            "Prepare the reported 50 µM assemblies and compare CD spectra with and without added KCl."
          ],
          "characterization": "The source poster contains CD spectra, molar ellipticity at 222 and 208 nm, and the reported 222/208 ratios. It also presents HPLC and ESI/MALDI-TOF characterization for the historical material.",
          "interpretation": "These comparisons motivate the assembly question. They do not establish a defined guanine-quartet bundle, hemin binding or peroxidase activity.",
          "next": "Compare assemblies with and without hemin, then use matched controls for peroxide-dependent ABTS oxidation.",
          "sourceNote": "Only values recorded for this historical characterization are shown. Synthesis masses, yield, sample identifier and instrument model are not recorded in the linked source.",
          "sources": [
            {
              "id": "historical-poster",
              "title": "Historical Fairfield hemin-binding poster",
              "access": "Existing document permissions retained"
            },
            {
              "id": "notebook-preliminary",
              "title": "OneNote · Preliminary data",
              "access": "Existing notebook permissions retained"
            }
          ],
          "figureUrl": "https://alexw4123.github.io/guanosine-heme-cinematic-viewer/assets/heme-poster.jpg"
        }
      ],
      "sources": [
        {
          "id": "historical-poster",
          "title": "Historical Fairfield hemin-binding poster",
          "access": "Existing document permissions retained"
        },
        {
          "id": "heme-overview",
          "title": "GSPEG2 project overview and analysis",
          "access": "Existing document permissions retained"
        },
        {
          "id": "summer-report",
          "title": "Summer molecular construction report",
          "access": "Existing document permissions retained"
        },
        {
          "id": "notebook-background",
          "title": "OneNote · Project Background",
          "access": "Existing notebook permissions retained"
        },
        {
          "id": "notebook-preliminary",
          "title": "OneNote · Preliminary data",
          "access": "Existing notebook permissions retained"
        },
        {
          "id": "notebook-goals",
          "title": "OneNote · 2026 to 2027 goals",
          "access": "Existing notebook permissions retained"
        },
        {
          "id": "c45",
          "title": "C45 de novo heme peroxidase research",
          "url": "https://www.nature.com/articles/s41467-017-00541-4",
          "access": "Public"
        },
        {
          "id": "fehp",
          "title": "FeHP helical-bundle Ge–H insertion study",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12621988/",
          "access": "Public",
          "version_note": "Use the linked PMC version; do not infer final publication status from secondary metadata."
        },
        {
          "id": "gs-gkff",
          "title": "Guanosine-nucleopeptide nanofiber study",
          "url": "https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J",
          "access": "Public"
        },
        {
          "id": "gs-gkff-correction",
          "title": "Correction to the guanosine-nucleopeptide article",
          "url": "https://pubs.rsc.org/en/content/articlepdf/2026/cc/d6cc90031c",
          "access": "Public",
          "version_note": "Use corrected chemical drawings; do not copy superseded stereochemistry."
        },
        {
          "id": "glucose-precedent",
          "title": "Different hemin-peptide/glucose oxidase biosensor research",
          "url": "https://doi.org/10.1002/smsc.202400025",
          "access": "Public"
        },
        {
          "id": "heme-application-evidence-1",
          "title": "A specific drug-discovery connection",
          "url": "https://pubmed.ncbi.nlm.nih.gov/18699726/"
        }
      ],
      "sourceNote": "Project documents retain their existing permissions and may require the lab account.",
      "figure": {
        "url": "https://alexw4123.github.io/guanosine-heme-cinematic-viewer/assets/heme-poster.jpg",
        "caption": "Historical Fairfield research poster · experimental samples and characterization, separate from the computational PEG2 model."
      },
      "summary": "Hemin is an iron-containing cofactor. The design places it inside four guanosine-capped peptide helices. PEG2 joins each cap to its peptide, and histidines face the iron. The experiments ask whether the assembly binds hemin and changes its catalytic activity.",
      "nextExperiment": "Start with assembly, circular-dichroism and hemin-binding comparisons. Then compare ABTS oxidation in assemblies with and without hemin, alongside free-hemin and reagent controls."
    }
  }
};
