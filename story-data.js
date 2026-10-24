// Editorial configuration for two separate molecular films.
// All asset paths below are relative to each exported app's root.
export const EVIDENCE_TAGS = Object.freeze({
  SOURCE: 'SOURCE STRUCTURE',
  DESIGN: 'DESIGN ANIMATION',
  MD: 'REAL MD',
  APPLICATION: 'PROPOSED APPLICATION',
});

const indexSelection = (start, end) => '@' + Array.from({ length: end - start + 1 }, (_, i) => start + i).join(',');
const stages = (items) => items.map((item, index) => ({
  id: `${index + 1}`, start: index * 10, end: (index + 1) * 10,
  startSeconds: index * 10, durationSeconds: 10, ...item,
}));

const hemeSelections = {
  all: 'all', protein: 'protein',
  cofactor: indexSelection(1140, 1212), heme: indexSelection(1140, 1212),
  caps: '[GS2]', candidate: '[GS2]',
  chains: [indexSelection(0, 283), indexSelection(284, 569), indexSelection(570, 853), indexSelection(854, 1139)],
  segments: ['PEPA', 'PEPB', 'PEPC', 'PEPD', 'HEMA'],
};

export const PROJECTS = {
  heme: {
    id: 'heme', title: 'From Heme to Signal',
    subtitle: 'A molecular design, a real trajectory, a testable sensor idea.',
    durationSeconds: 60,
    pdbPath: 'assets/heme-original.pdb',
    trajectoryPath: 'data/heme-solute-trajectory.json',
    trajectoryPdbPath: 'assets/heme-solute.pdb',
    solventPath: 'data/heme-solvent-trajectory.json',
    defaultModel: 'design',
    models: [
      { id: 'design', title: 'Original viewer design', pdbPath: 'assets/heme-original.pdb', atomCount: 1213,
        tag: EVIDENCE_TAGS.SOURCE, selections: hemeSelections,
        note: 'Original public-viewer coordinates. Constructed design, not an experimentally determined structure. Never apply trajectory frames to this layer.' },
      { id: 'asRun', title: 'As-run solution model', pdbPath: 'assets/heme-solute.pdb', topologyPath: 'assets/heme-solute.psf',
        trajectoryPath: 'data/heme-solute-trajectory.json', atomCount: 1213, tag: EVIDENCE_TAGS.MD,
        selections: hemeSelections,
        note: 'Matching solute PDB/PSF and retained trajectory frames. Distinct coordinate layer from the original viewer design.' },
    ],
    selections: hemeSelections,
    sourceAssetPaths: {
      originalDesign: 'assets/heme-original.pdb',
      trajectoryStructure: 'assets/heme-solute.pdb', trajectoryTopology: 'assets/heme-solute.psf',
      compactTrajectory: 'data/heme-solute-trajectory.json', compactPositions: 'data/heme-solute-positions.f32.bin',
      sparseSolvent: 'data/heme-solvent-trajectory.json', sparseSolventPositions: 'data/heme-solvent-positions.f32.bin',
      originalFrameMap: 'data/heme-solute-trajectory.json#frameIndices',
    },
    stages: stages([
      {
        title: 'Start with the atoms', tag: EVIDENCE_TAGS.SOURCE, focus: 'all', modelId: 'design',
        caption: 'Four peptide helices, guanosine caps, and heme define the starting design. These coordinates are a constructed model.',
        detail: 'Explore the actual atoms supplied with the original viewer. Heme contains the iron center; the peptide scaffold and PEG2-linked guanosine caps are design components. This is not a crystal structure or a measurement of self-assembly.',
      },
      {
        title: 'Imagine the pieces together', tag: EVIDENCE_TAGS.DESIGN, focus: 'assembly', modelId: 'design',
        caption: 'Components separate and reunite to explain the architecture. This rigid-component animation illustrates the design; it does not show observed self-assembly.',
        detail: 'The film may translate and rotate intact components for explanation. Their return to the supplied arrangement is an illustration, not a folding calculation, a guanosine-quartet formation event, or evidence that the assembly occurs spontaneously.',
        animationType: 'rigid-components', observedAssembly: false,
      },
      {
        title: 'Watch the recorded motion', tag: EVIDENCE_TAGS.MD, focus: 'trajectory', modelId: 'asRun',
        caption: 'Now switch to the matching as-run model: 120 genuine saved frames reveal sampled motion. Physical simulation time remains unverified.',
        detail: 'The source contains 23,558 atoms and 5,000 saved frames. This view retains the 1,213-atom solute at original frame indices 0, 42, 84, through 4,998. All atoms in each frame received one rigid alignment to the first retained protein backbone. No new dynamics or internal coordinate changes were introduced. Optional sparse solvent data retain every 24th original water oxygen and all 64 original ions at the same frames. This visual sparsification does not depict literal solvent density. Any additional decorative solvent must be labeled illustrative.',
        frameLabel: 'Saved frame', physicalTimeVerified: false,
      },
      {
        title: 'A reactive center, a question', tag: EVIDENCE_TAGS.DESIGN, focus: 'activeSite', modelId: 'asRun',
        caption: 'Could this scaffold support peroxide chemistry? The catalytic cycle is a schematic, while heme coordination and access remain design questions.',
        detail: 'Peroxidase mimetics can couple peroxide chemistry to oxidation of a reporter such as ABTS. That known chemistry motivates this design; it was not observed in these classical MD frames. The source topology imposes Fe–His bonds, so their persistence cannot establish spontaneous binding or ligand exchange. Two axial histidines raise a testable question about stabilization versus access to an iron coordination site. Do not depict bond breaking as an output of this trajectory.',
        animationType: 'mechanism-schematic',
      },
      {
        title: 'A sample becomes a signal', tag: EVIDENCE_TAGS.APPLICATION, focus: 'application', modelId: 'asRun',
        caption: 'An outside-body biosensor could translate peroxide-dependent chemistry into color or an electrical signal. This device concept still needs experimental validation.',
        detail: 'Show a sample entering a test well or sensor surface outside the body. A colorimetric reporter or electrode could make chemistry measurable. The animation is an application concept, not a calibrated instrument or demonstrated diagnostic. Do not invent detection limits, response times, selectivity, or performance curves.',
        applicationContext: 'outside-body assay', animationType: 'sensor-concept',
      },
      {
        title: 'Let experiments decide', tag: EVIDENCE_TAGS.APPLICATION, focus: 'evidence', modelId: 'asRun',
        caption: 'Next: verify assembly and heme binding, measure catalysis, then test calibration, selectivity, and stability against clear controls.',
        detail: 'The present evidence supports a molecular design and replay of an existing model. Guanosine-quartet persistence, structural potassium placement, and GS2 parameter validity require further checking. Establish folding and heme binding; compare the assembly with free heme, apo peptide, blanks, and a suitable peroxidase benchmark. Only measured calibration, interference, repeatability, and stability can support a sensor claim.',
        nextEvidence: ['Assembly and folding', 'Heme binding and coordination', 'Peroxide-dependent activity with controls', 'Sensor calibration, interference and stability'],
      },
    ]),
    methods: [
      { title: 'Two coordinate layers', text: 'The original viewer design and as-run trajectory are separate models. The trajectory is applied only to its matched solute PDB and PSF. Camera movement and component assembly are presentation effects.' },
      { title: 'What the binary contains', text: 'Float32 little-endian coordinates in frame-major XYZ order: 120 × 1,213 × 3 values. Every coordinate bit matches the existing aligned solute DCD. Source-frame map: index i maps to original saved frame 42 × i, for i = 0…119.' },
      { title: 'Sparse authentic solvent', text: 'The optional solvent track contains 310 real water oxygen positions and all 64 real source ions at the same 120 retained frames. Coordinates bitwise match the existing aligned solution DCD. Dots are sparse samples of the simulation solution, not a literal representation of molecular density or assay formulation.' },
      { title: 'Playback is not elapsed laboratory time', text: 'Sixty seconds is the film duration. The source filename includes 0–100 ns, but production timestep, saved-frame spacing, offsets, and processing have not been independently verified. Use saved-frame numbers, not nanoseconds.' },
      { title: 'Model limitations', text: 'The topology imposes Fe–His bonds. GS2 parameters and potassium coordination require scientific validation. Classical fixed-topology MD does not show peroxide bond cleavage, electronic intermediates, catalytic turnover, or sensor performance.' },
      { title: 'Prior work and the open question', text: 'Guanosine-containing nucleopeptide peroxidase mimetics and designed heme proteins on electrodes already exist. This project asks about its particular guanosine-capped helical architecture; a claim of first discovery is not established.' },
    ],
    sources: [
      { title: 'Original heme-bundle viewer', url: 'https://github.com/alexw4123/guanosine-heme-bundle-viewer', note: 'Original project and structural viewer; preserve independently from this cinematic presentation.' },
      { title: 'Nucleopeptide peroxidase mimetics', url: 'https://doi.org/10.1039/D5CC05835J', note: 'O’Neill and colleagues, 2025: guanosine-containing nanofibers and ABTS oxidation; different architecture from the modeled helical bundle.' },
      { title: 'Corrected chemical drawing', url: 'https://doi.org/10.1039/D6CC90031C', note: '2026 correction to stereochemistry in the earlier paper’s drawing; use corrected chemistry in any detailed diagram.' },
      { title: 'Designed heme proteins on electrodes', url: 'https://www.princeton.edu/~hecht/papers/2007%20das%20peroxidase.pdf', note: 'Das and Hecht, 2007: prior electrochemical peroxidase activity; contextual precedent, not evidence for this project.' },
      { title: 'Why reaction chemistry needs another method', url: 'https://www.ks.uiuc.edu/Research/qmmm/', note: 'Official NAMD explanation of classical force-field limitations and QM/MM reaction modeling.' },
    ],
  },
  dhfr: {
    id: 'dhfr', title: 'Two Candidates, One Molecular Target',
    subtitle: 'Explore a research question at human DHFR.',
    durationSeconds: 60, pdbPath: 'assets/dhfr-gs-connected.pdb', defaultModel: 'gs',
    trajectoryPath: null,
    models: [
      { id: 'gs', title: 'GS–Phe–Glu', pdbPath: 'assets/dhfr-gs-connected.pdb', atomCount: 3153,
        tag: EVIDENCE_TAGS.SOURCE, candidateResidueName: 'GSP',
        selections: { all: 'all', protein: indexSelection(0, 3012), cofactor: indexSelection(3013, 3086), candidate: indexSelection(3087, 3152) },
        note: 'Prepared, unsolvated starting model. Candidate pose and binding are unresolved hypotheses; no minimization or MD is represented.' },
      { id: 'isog', title: 'isog–Phe–Glu', pdbPath: 'assets/dhfr-isog-connected.pdb', atomCount: 3153,
        tag: EVIDENCE_TAGS.SOURCE, candidateResidueName: 'IGP',
        selections: { all: 'all', protein: indexSelection(0, 3012), cofactor: indexSelection(3013, 3086), candidate: indexSelection(3087, 3152) },
        note: 'Prepared, unsolvated starting model. Candidate pose and binding are unresolved hypotheses; no minimization or MD is represented.' },
    ],
    selections: { all: 'all', protein: indexSelection(0, 3012), cofactor: indexSelection(3013, 3086), candidate: indexSelection(3087, 3152) },
    sourceAssetPaths: { gs: 'assets/dhfr-gs-connected.pdb', isog: 'assets/dhfr-isog-connected.pdb', displayProvenance: 'assets/dhfr-display-provenance.json' },
    stages: stages([
      {
        title: 'Meet the molecular target', tag: EVIDENCE_TAGS.SOURCE, focus: 'all',
        caption: 'Human DHFR, a modeled NADPH cofactor, and one candidate form the starting scene. The candidate arrangement is a prepared hypothesis.',
        detail: 'These files derive from human DHFR chain A in PDB 4M6K. The deposited structure contains oxidized NADP+ and folic acid. The research preparation replaced that state with a modeled NADPH−4 cofactor and candidate nucleopeptides; the resulting candidate complexes are not experimental structures.',
      },
      {
        title: 'Change one part of the design', tag: EVIDENCE_TAGS.DESIGN, focus: 'assembly',
        caption: 'Compare GS–Phe–Glu with isog–Phe–Glu. Moving intact components into place explains the comparison; it does not establish binding.',
        detail: 'The two candidates share a peptide component while changing the nucleoside component. Their donor and acceptor arrangements motivate a comparison of possible pocket interactions. An animated approach to the pocket is illustrative placement, not a docking result, binding event, or measured affinity. Switch candidates to inspect the actual prepared coordinates.',
        animationType: 'rigid-components', observedBinding: false,
      },
      {
        title: 'Before a simulation can begin', tag: EVIDENCE_TAGS.DESIGN, focus: 'trajectory',
        caption: 'There is no DHFR trajectory yet. A solution scene is illustrative; these unsolvated starting models have not undergone minimization or MD.',
        detail: 'The project has prepared native CHARMM models for two candidate complexes, free candidates, and a DHFR–NADPH control. No authentic DHFR motion or solvent coordinates were supplied for this film. Any surrounding water, diffusion, or mixing is explicitly conceptual. Do not attach a molecular-dynamics clock or fabricated motion trace.',
        animationType: 'solution-preparation-concept', physicalTimeVerified: false, realTrajectoryAvailable: false,
      },
      {
        title: 'Why this pocket matters', tag: EVIDENCE_TAGS.DESIGN, focus: 'activeSite',
        caption: 'NADPH helps DHFR convert dihydrofolate into tetrahydrofolate, supporting nucleotide synthesis. Whether either candidate inhibits that process remains untested.',
        detail: 'The known reaction couples NADPH oxidation to dihydrofolate reduction. Methotrexate provides an established example of targeting DHFR in some cancer therapies, but it is a different compound. This mechanism cartoon is literature context, not a reaction observed in these models. Do not show a candidate causing a confirmed chemical block.',
        animationType: 'mechanism-schematic',
      },
      {
        title: 'A possible path toward cells', tag: EVIDENCE_TAGS.APPLICATION, focus: 'application',
        caption: 'A delivery concept imagines a candidate reaching cellular DHFR. Uptake, target inhibition, selectivity, and safety are unknown; treatment benefit is unproven.',
        detail: 'Any body, tissue, membrane, or delivery particle is a proposed research context. Do not present a route of administration, dose, tumor targeting, cellular entry, or anticancer efficacy as established. The scientific question is whether these candidates can become useful inhibitors; a molecular pose alone cannot answer it.',
        applicationContext: 'speculative delivery and cellular target', animationType: 'delivery-concept',
      },
      {
        title: 'Build the evidence step by step', tag: EVIDENCE_TAGS.APPLICATION, focus: 'evidence',
        caption: 'Next: validate chemistry and poses, measure binding and inhibition, then examine uptake, cellular selectivity, stability, and safety.',
        detail: 'Validate the candidate and cofactor parameterization, protonation, and starting poses before interpreting dynamics. Experimental target binding and enzyme inhibition need appropriate controls and interference checks. Cellular uptake, target engagement, and a useful separation between tumor and normal-cell effects are separate questions. Neither clinical efficacy nor safety follows from this visualization.',
        nextEvidence: ['Chemical identity and parameter validation', 'Plausible poses and controlled simulations', 'Binding and enzyme inhibition', 'Uptake, target engagement, selectivity and safety'],
      },
    ]),
    methods: [
      { title: 'What is actually displayed', text: 'Two 3,153-atom prepared starting models: human DHFR chain A, modeled N4P cofactor in chain C, and GSP or IGP candidate in chain L. Both are unsolvated; no DHFR dynamics were supplied.' },
      { title: 'Experimental reference versus prepared model', text: 'PDB 4M6K contains unmutated human DHFR with oxidized NADP+ and folic acid. The NADPH−4 state and candidate complexes are modeled replacements. They must not be labeled as deposited experimental complexes.' },
      { title: 'Connectivity is a display aid', text: 'Connected PDB derivatives add explicit PSF-recorded connectivity: 3,195 unique bonds per 3,153-atom model. All original atom records and coordinates remain unchanged, with no cross-segment or ligand–protein bonds. Recorded topology is not validation of chemistry or binding.' },
      { title: 'Cancer relevance and its limits', text: 'DHFR is an established target of drugs such as methotrexate in specified cancer therapies. These particular nucleopeptide candidates have not been established as effective or safe treatments. Binding, inhibition, delivery, and clinical benefit are distinct evidence steps.' },
      { title: 'Prior work and the open question', text: 'Peptide-based human DHFR inhibitors have been studied experimentally. The present comparison concerns the specific GS–Phe–Glu and isog–Phe–Glu candidates; a first-discovery claim has not been established.' },
    ],
    sources: [
      { title: 'Human DHFR reference: PDB 4M6K', url: 'https://www.rcsb.org/structure/4M6K', note: 'Experimental human DHFR–NADP+–folate structure; starting reference, not the prepared candidate complexes.' },
      { title: 'Human DHFR dynamics differ from bacterial DHFR', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3823643/', note: 'Bhabha and colleagues, 2013: primary structural and dynamics study underlying 4M6K.' },
      { title: 'Prior peptide-based DHFR inhibitor research', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5816602/', note: '2018 primary study with different peptides, enzyme inhibition, binding, and cell assays; no validation of these nucleopeptides.' },
      { title: 'Established methotrexate mechanism and indications', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=948e0bab-6524-4b87-9853-1799d4415558', note: 'Official labeling for a different, established medicine; context for DHFR relevance, not a treatment claim for this research.' },
    ],
  },
};

export const getProject = (id) => PROJECTS[id];
if (typeof window !== 'undefined') window.CINEMATIC_PROJECTS = PROJECTS;
export default PROJECTS;
