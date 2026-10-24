/* Eight source-linked scenes. Assay and chemistry illustrations do not imply measured bundle performance. */
(() => {
  const sources={
    project:{title:'GSPEG2 project overview and analysis',url:'https://docs.google.com/document/d/1rmexqF9TSg2FgBzd4zzPp6pdkmKvPH0Gi1d7rOUiM1I/edit'},
    summer:{title:'Summer molecular construction report',url:'https://docs.google.com/document/d/1NmHqWayKZAZlZEAxd_fjIPbdLHrgdXQmOLS8Min0uEo/edit'},
    c45:{title:'C45: a designed heme peroxidase',url:'https://www.nature.com/articles/s41467-017-00541-4'},
    glucose:{title:'SP1-hemin coupled glucose-biosensing study',url:'https://doi.org/10.1002/smsc.202400025'},
    cholesterol:{title:'Cholesterol oxidase and hemin-G-quadruplex ABTS assay',url:'https://pubmed.ncbi.nlm.nih.gov/22483213/'},
    methotrexate:{title:'Methotrexate aptamer/hemin-DNAzyme assay in diluted human serum',url:'https://pubmed.ncbi.nlm.nih.gov/36965245/'},
    lab:{title:'Smith-Carpenter Lab guanosine-nucleopeptide peroxidase study',url:'https://pubs.rsc.org/en/Content/ArticleLanding/2025/CC/D5CC05835J'},
    correction:{title:'Correction to the guanosine-nucleopeptide article',url:'https://pubs.rsc.org/en/content/articlepdf/2026/cc/d6cc90031c'}
  };
  window.RESEARCH_STORY={
    project:'heme',title:'From an invisible molecule to a measurement',
    subtitle:'Follow sample preparation, target recognition, heme chemistry and the controls that make a signal useful.',
    durationSeconds:120,
    scaleNote:'Scale labels indicate the level of explanation. Objects, colour intensity and elapsed time are illustrative.',
    scenes:[
      {
        id:'sample',title:'A sample outside the body',question:'Where does a chemical measurement begin?',
        caption:'A blood sample is prepared for an assay outside the body. Serum contains proteins, salts and many molecules. Before color can mean concentration, the test needs a target-specific recognition step, a reporter and controls for the sample background.',
        scale:'Person to assay chamber · cm to mm',breadcrumb:['Person','Sample','Assay chamber'],durationSeconds:15,
        evidenceType:'Assay illustration',evidenceNote:'The serum scene is application context. No patient sample has been measured with this four-helix bundle here.',
        deep:'The catalyst is a possible laboratory reagent in this story. It is not injected into the person. Published methotrexate and cholesterol sensing studies motivate serum examples, but each used its own recognition system and reporter material. Their results cannot be transferred to the PEG2 assembly.',
        labels:['Prepared serum sample','Proteins + salts','Target molecules','Possible interferents'],sources:[sources.methotrexate,sources.cholesterol]
      },
      {
        id:'recognition',title:'Recognition comes before reporting',question:'What makes the signal belong to a particular target?',
        caption:'A heme catalyst is a reporter, not a universal target detector. Glucose oxidase and cholesterol oxidase can generate peroxide from their substrates. A published methotrexate assay instead used aptamer recognition and DNA amplification to control a hemin-DNAzyme reporter.',
        scale:'Recognition chemistry · nm',breadcrumb:['Sample','Recognition','Reporter input'],durationSeconds:15,
        evidenceType:'Published assay examples',evidenceNote:'These are distinct published architectures. None establishes target detection by the displayed PEG2 model.',
        deep:'Recognition identifies the target; reporting creates a measurable output. Choose a route to see which chemical step connects the target to the reporter. The enzymes and aptamer shown are explanatory shapes, not their experimental atomic structures.',
        labels:['Target recognition','Reporter chemistry','Separate functions'],sources:[sources.glucose,sources.cholesterol,sources.methotrexate],
        variants:{
          glucose:{question:'How can glucose create a peroxide input?',caption:'Glucose oxidase reacts with glucose and oxygen, producing hydrogen peroxide. A validated peroxide reporter could turn that output into color. The recognition belongs to glucose oxidase; changing the heme reporter does not automatically improve glucose selectivity.',evidenceType:'Published cascade example',evidenceNote:'GOx-to-peroxide coupling has precedent; this PEG2 bundle has no glucose calibration.',deep:'A different SP1-hemin system has been used in an optical glucose platform. A bundle-based version would need peroxide validation first, then full coupled-assay calibration and interference comparisons in the intended sample.',labels:['Glucose + oxygen','Glucose oxidase','Hydrogen peroxide','Reporter'],sources:[sources.glucose]},
          cholesterol:{question:'What changes when the target is cholesterol?',caption:'Cholesterol oxidase generates peroxide during cholesterol oxidation. Published hemin-G-quadruplex assays connect that peroxide to ABTS oxidation. The recognition enzyme changes with the target; the peroxide-reporting question remains separate.',evidenceType:'Published cascade example',evidenceNote:'The cited assay used a DNAzyme, not this nucleopeptide bundle.',deep:'The published cholesterol assay combined cholesterol oxidase with hemin-G-quadruplex catalysis and tested serum samples. Its performance belongs to that material and preparation. A new reporter requires its own standards, blank correction and sample-interference study.',labels:['Cholesterol + oxygen','Cholesterol oxidase','Hydrogen peroxide','Reporter'],sources:[sources.cholesterol]},
          methotrexate:{question:'How could the same medicine be measured in a sample?',caption:'A published methotrexate aptamer assay used recognition and DNA amplification to generate hemin-G-quadruplex reporters. It measured diluted human serum. Methotrexate does not generate the peroxide input in this scheme, and the PEG2 bundle has not demonstrated methotrexate detection.',evidenceType:'Published medication assay',evidenceNote:'An aptamer/amplification/DNAzyme precedent, not a demonstrated application of this bundle.',deep:'The reported route couples methotrexate binding to polymerization/nicking amplification, G-quadruplex production and hemin-DNAzyme color reporting. This connects medicine action to medicine measurement conceptually; it does not establish that an aptamer can simply be replaced by the four-helix assembly.',labels:['Methotrexate','Specific aptamer','DNA amplification','Hemin-DNAzyme reporter'],sources:[sources.methotrexate]}
        }
      },
      {
        id:'bundle',title:'Enter the four-helix model',question:'What part of the reporter could this project change?',
        caption:'The project places hemin inside four guanosine-PEG2-capped peptide chains. The helices provide the scaffold, the caps motivate assembly, and histidines face the iron. This constructed arrangement is the design to test, not observed self-assembly or established sensor performance.',
        scale:'Bundle · nm',breadcrumb:['Assay','Reporter','Four-helix model'],durationSeconds:15,
        evidenceType:'Project structural model',evidenceNote:'The linked explorer contains the original 1,213-atom PEG2 coordinates, preserved separately from the simulation model.',
        deep:'The opening model, early summer constructions, the as-run simulation and the corrected reference are distinct versions. The four chains also do not share a single peptide sequence. Historical sample characterization should not be assigned to this model without reconciling the construct and sequence records.',
        labels:['Peptide helices','Guanosine-PEG2 caps','Hemin','Histidines'],modelSelection:{mode:'secondary',component:'all'},sources:[sources.project,sources.summer],
        variants:{methotrexate:{caption:'The published methotrexate sensor uses a hemin-DNAzyme reporter. This four-helix PEG2 bundle is a separate material to investigate. Its structure does not establish that it can replace that reporter or measure the medication.',evidenceType:'Separate research model',evidenceNote:'No methotrexate recognition or assay performance is established for this bundle.',sources:[sources.project,sources.methotrexate]}}
      },
      {
        id:'iron',title:'Hold heme, leave chemistry accessible',question:'Can the pocket retain the cofactor and still let it react?',
        caption:'Zoom from the helices to histidine, the porphyrin ring and iron. The source model specifies two iron-histidine connections. Those bonds hold a geometry in the model; experiments must establish hemin binding and whether peroxide can reach a useful reaction site.',
        scale:'Iron coordination · Å',breadcrumb:['Bundle','Hemin','Iron site'],durationSeconds:15,
        evidenceType:'Model and design question',evidenceNote:'The displayed Fe-His bonds are specified topology connections. Their persistence is not a measured binding affinity.',
        deep:'The C45 precedent used a different, monohistidine-ligated heme design with demonstrated peroxidase activity. It motivates testing access and coordination here. It does not prove that the displayed bis-histidine pocket has the same mechanism, turnover or stability.',
        labels:['Histidine','Porphyrin ring','Iron','Access to the heme site'],modelSelection:{mode:'atomic',component:'heme'},sources:[sources.project,sources.c45]
      },
      {
        id:'catalysis',title:'Peroxide to oxidized ABTS',question:'How can heme chemistry produce a colored reporter?',
        caption:'In a heme-peroxidase mechanism, peroxide creates an oxidized catalytic intermediate. Reporter-electron transfers return the catalyst toward its resting state while ABTS is oxidized. This sequence explains the chemistry to test; it is not a reaction observed in the bundle simulation.',
        scale:'Reaction chemistry · Å',breadcrumb:['Assay','Heme site','Reporter reaction'],durationSeconds:15,
        evidenceType:'Mechanism illustration',evidenceNote:'Bond changes and intermediates are explanatory. Fixed-topology simulation playback does not establish this catalytic cycle.',
        deep:'A teaching cycle can show ferric heme, Compound I and Compound II, followed by return to ferric heme through two one-electron reporter oxidations. The exact intermediates and reactive access in this bundle remain unmeasured. C45 demonstrates useful designed-heme chemistry in a different scaffold.',
        labels:['H₂O₂ input','Oxidized heme intermediate','ABTS oxidation','Catalyst returns'],sources:[sources.c45,sources.project]
      },
      {
        id:'signal',title:'Many reactions become visible',question:'How does a molecular event become a bulk signal?',
        caption:'Oxidized ABTS accumulates across many reporter reactions and produces a green optical signal. A spectrophotometer measures absorbance or its change with time. The animated color is explanatory; it is not a measured rate or yield for this bundle.',
        scale:'Molecules to solution · nm to mm',breadcrumb:['Reporter molecules','Bulk color','Optical readout'],durationSeconds:15,
        evidenceType:'Signal illustration',evidenceNote:'Color and particle numbers are illustrative. No bundle activity or sensitivity is inferred from this scene.',
        deep:'A green signal alone does not identify what produced it. Hemin, the peptide material, the target-recognition system and sample components can affect the readout. Separate reagent controls and a peroxide-dependence check are needed before interpreting a change as useful reporting.',
        labels:['ABTS','Oxidized ABTS','Green solution','Absorbance'],sources:[sources.c45,sources.lab,sources.project]
      },
      {
        id:'calibration',title:'Turn color into a measurement',question:'What allows an unknown sample to be interpreted?',
        caption:'Compare a blank, known standards and an unknown under the same conditions. Calibration connects a corrected optical response to concentration over a stated range. Background, interference and repeatability decide whether the result can be trusted.',
        scale:'Assay chamber to instrument · mm to cm',breadcrumb:['Blank','Standards','Unknown','Calibration'],durationSeconds:15,
        evidenceType:'Measurement design',evidenceNote:'The standards and plot are illustrative, without invented concentrations or performance data.',
        deep:'Establish peroxide reporting first. A glucose or cholesterol application then needs calibration of the complete coupled assay. A medication assay needs a validated recognition and reporting architecture. Dilution and complex sample backgrounds must be evaluated rather than assumed harmless.',
        labels:['Blank','Known standards','Unknown','Corrected response'],sources:[sources.project,sources.glucose,sources.cholesterol,sources.methotrexate]
      },
      {
        id:'comparison',title:'What would make this material useful?',question:'Which experiment could show an advantage?',
        caption:'Compare free hemin, peptide alone, peptide plus hemin and an established peroxidase. Measure activity, cofactor retention, storage behavior and preparation-to-preparation variation. A useful difference must be demonstrated under matched conditions, not inferred from the model’s appearance.',
        scale:'Materials to assay performance',breadcrumb:['Design','Controlled comparison','Measured result'],durationSeconds:15,
        evidenceType:'Research next steps',evidenceNote:'Related lab nanofibers oxidized ABTS with and without hemin; they differ from the displayed four-helix design.',
        deep:'The Smith-Carpenter Lab’s published guanosine-nucleopeptide work makes the peptide-only control especially important. Its nanofiber architecture and corrected chemical drawings must be kept distinct from this PEG2 bundle. Better cofactor retention, useful lifetime, surface attachment or sample compatibility are testable aims, not established benefits.',
        labels:['Free hemin','Peptide only','Peptide + hemin','Reference peroxidase'],sources:[sources.lab,sources.correction,sources.project]
      }
    ]
  };
  const onstage={
    sample:'The measurement happens outside the body. A prepared sample needs target recognition, reporting chemistry and background controls.',
    recognition:'Recognition identifies the target. The heme reporter creates a signal. Choose a route to see the chemistry connecting them.',
    bundle:'Four capped peptides surround hemin in the constructed PEG2 model. Assembly, binding and reporter activity require separate tests.',
    iron:'The model specifies two iron-histidine connections. Holding hemin securely and preserving access for peroxide are different design requirements.',
    catalysis:'Peroxide activates a heme-peroxidase cycle; reporter oxidation returns the catalyst. This mechanism illustration is not a measured bundle reaction.',
    signal:'Many oxidized ABTS molecules create a green optical signal. The animated color is illustrative, not measured bundle performance.',
    calibration:'Compare a blank, standards and an unknown. Calibration, interference and repeatability decide whether color becomes a useful measurement.',
    comparison:'Compare hemin, peptide alone, peptide plus hemin and a reference enzyme. Any advantage needs a matched experimental measurement.'
  };
  const shortVariants={
    recognition:{
      glucose:'Glucose oxidase generates peroxide from glucose and oxygen. The reporter reads peroxide; the enzyme provides glucose recognition.',
      cholesterol:'Cholesterol oxidase generates peroxide. Published hemin-DNAzyme assays report it through ABTS; this bundle still needs its own validation.',
      methotrexate:'A published methotrexate aptamer assay amplified hemin-DNAzyme reporting. Methotrexate did not generate peroxide, and this PEG2 bundle was not the reporter.'
    },
    bundle:{methotrexate:'The published methotrexate assay used a DNAzyme. This four-helix bundle is a separate reporter design, without demonstrated medication detection.'}
  };
  for(const scene of window.RESEARCH_STORY.scenes){
    scene.onstageCaption=onstage[scene.id];
    for(const [key,variant] of Object.entries(scene.variants||{}))variant.onstageCaption=shortVariants[scene.id]?.[key]||onstage[scene.id];
  }
})();
