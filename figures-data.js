/* Source figures retain their project version, measurement context and provenance. */
window.RESEARCH_FIGURES = {
  version:'2026-10-24.1',
  heme:[
    {
      id:'summer-construction',
      title:'Summer construction · earlier molecular designs',
      intro:'These source images document constructed starting geometries before the mixed His/Ala PEG2 model. They do not show observed self-assembly.',
      figures:[
        {path:'assets/figures/summer-linkage-view-source.png',title:'Early guanosine-linked monomer',shortCaption:'Early direct-link monomer · summer report',alt:'Summer source molecular image of one guanosine-linked peptide after a custom amide bond was added.',caption:'Early guanosine-linked monomer after a custom amide connection was added. This direct-link prototype predates the mixed His/Ala PEG2 model.',source:'https://docs.google.com/document/d/1NmHqWayKZAZlZEAxd_fjIPbdLHrgdXQmOLS8Min0uEo/edit'},
        {path:'assets/figures/summer-nucleopeptide-source.png',title:'Four-chain starting arrangement',shortCaption:'Constructed four-chain arrangement · summer report',alt:'Summer source molecular image of four early nucleopeptide chains arranged as a starting bundle.',caption:'Four early nucleopeptide chains arranged as a starting bundle. The geometry was constructed; this image does not establish experimental assembly stoichiometry or observed self-assembly.',source:'https://docs.google.com/document/d/1NmHqWayKZAZlZEAxd_fjIPbdLHrgdXQmOLS8Min0uEo/edit'},
        {path:'assets/figures/summer-tetramer-source.png',title:'Early all-histidine pocket',shortCaption:'Early all-His pocket · before heme placement',alt:'Summer source image of an early all-histidine pocket with yellow nitrogen-distance measurements.',caption:'Early all-His pocket before heme placement. Yellow measurements between neighboring histidine nitrogens are 4.387 Å in this constructed geometry. This earlier model is distinct from the mixed His/Ala PEG2 reference.',source:'https://docs.google.com/document/d/1NmHqWayKZAZlZEAxd_fjIPbdLHrgdXQmOLS8Min0uEo/edit'},
        {path:'assets/figures/summer-mono-his-pocket-source.png',title:'Early one-histidine heme placement',shortCaption:'Manual one-His placement · early geometry test',alt:'Summer source image of manually placed heme with a measured Fe–His distance.',caption:'Early manually placed heme model with a modeled Fe–His distance of 2.150 Å. This geometry test is distinct from the later A/C bis-His PEG2 model and is not a binding measurement.',source:'https://docs.google.com/document/d/1NmHqWayKZAZlZEAxd_fjIPbdLHrgdXQmOLS8Min0uEo/edit'}
      ]
    },
    {
      id:'as-run-analysis',
      title:'Original as-run simulation · analysis figures',
      intro:'These plots belong to the original saved trajectory, rather than the later corrected dry reference. Their horizontal axes show saved-frame indices; physical nanoseconds remain unverified.',
      figures:[
        {path:'assets/figures/bundle_core_rg.png',title:'Core radius of gyration',shortCaption:'Core radius of gyration · original as-run trajectory',alt:'Original as-run core radius-of-gyration plot in angstroms against saved-frame index.',caption:'Original as-run trajectory: the selected core remained compact. Radius of gyration measures the spread of selected backbone atoms around their center, not whether every internal coordinate stayed unchanged. Source plot: core Cα, residue IDs 3–15 on PEPA–D, stride 10; radius is in Å and the horizontal axis is saved frame, not verified nanoseconds.',source:'https://drive.google.com/file/d/1i3dcySEdLx3LbbZD_vZLzOWjXVxy_CaA/view'},
        {path:'assets/figures/heme_geometry.png',title:'Imposed heme coordination geometry',shortCaption:'Fe–His geometry · original as-run imposed bonds',alt:'Original as-run plots of Fe–His distances and coordination geometry across saved frames.',caption:'Original as-run trajectory: Fe–His distances fluctuate near 2.11 Å. The Fe–His connections were imposed topology bonds, so this checks their geometry and does not demonstrate spontaneous hemin binding. Distance axes are in Å; horizontal axes show saved-frame indices. A physical nanosecond interval is unverified.',source:'https://drive.google.com/file/d/1Mgh5x-j6sFNRXfoZoB2nY3nAJv5QVaZT/view'},
        {path:'assets/figures/gs2_quartet_hbonds.png',title:'Predefined guanine-contact distances',shortCaption:'Tested guanine contacts · original as-run trajectory',alt:'Original as-run distance-versus-frame plots for predefined contacts among the GS2 caps.',caption:'Original as-run trajectory: the predefined guanine contacts did not remain consistently short. These checks do not show a persistent quartet and do not establish that a quartet first formed and then fell apart. Distance axes are in Å; horizontal axes show saved-frame indices.',source:'https://drive.google.com/file/d/1LWQ0iZKCP51Ee9BxioiF0RVbXLgeeXAE/view'}
      ]
    }
  ]
};
