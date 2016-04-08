define([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/on", "dojo/topic", "dojo/dom-construct",
	"dijit/layout/BorderContainer", "dijit/layout/StackContainer", "dijit/layout/TabController", "dijit/layout/ContentPane",
	"dijit/form/RadioButton", "dijit/form/Textarea", "dijit/form/TextBox", "dijit/form/Button",
	"./ActionBar", "./ContainerActionBar",
	"./ProteinFamiliesGridContainer", "./ProteinFamiliesFilterGrid", "./ProteinFamiliesHeatmapContainer",
	"./ProteinFamiliesMembersGridContainer"
], function(declare, lang, on, Topic, domConstruct,
			BorderContainer, TabContainer, StackController, ContentPane,
			RadioButton, TextArea, TextBox, Button,
			ActionBar, ContainerActionBar,
			ProteinFamiliesGridContainer, ProteinFamiliesFilterGrid, ProteinFamiliesHeatmapContainer,
			ProteinFamiliesMembersGridContainer){

	return declare([BorderContainer], {
		id: "PFContainer",
		gutters: false,
		state: null,
		maxGenomeCount: 10000,
		apiServer: window.App.dataServiceURL,
		constructor: function() {
			var self = this;

			Topic.subscribe("ProteinFamilies", lang.hitch(self, function(){
				// console.log("ProteinFamiliesHeatmapContainer:", arguments);
				var key = arguments[0], value = arguments[1];

				switch(key){
					case "showMembers":
						self.proteinFamiliesMembersGrid.set("query", value);
						self.tabContainer.selectChild(self.proteinFamiliesMembersGrid);
						break;
					default:
						break;
				}
			}));
		},
		onSetState: function(attr, oldVal, state){
			//console.log("ProteinFamiliesContainer set STATE.  genome_ids: ", state.genome_ids, " state: ", state);
			if(this.proteinFamiliesGrid){
				this.proteinFamiliesGrid.set('state', state);
			}
			this._set('state', state);
		},

		visible: false,
		_setVisibleAttr: function(visible){
			this.visible = visible;

			if(this.visible && !this._firstView){
				this.onFirstView();
			}
			if(this.proteinFamiliesGrid){
				this.proteinFamiliesGrid.set('visible', true);
			}
			if(this.heatmap){
				this.heatmap.set('visible', true);
			}
			if(this.proteinFamiliesMembersGrid){
				this.proteinFamiliesMembersGrid.set('visible', true);
			}
		},

		onFirstView: function(){
			if(this._firstView){
				return;
			}

			var filterPanel = new ContentPane({
				region: "left",
				title: "filter",
				content: "Filter By",
				style: "width:400px; overflow:auto;",
				splitter: true
			});

			var familyTypePanel = new ContentPane({
				region: "top"
			});
			// plfam
			var rb_plfam = new RadioButton({
				name: "familyType",
				value: "plfam"
			});
			rb_plfam.on("click", function(){
				Topic.publish("ProteinFamilies", "familyType", "plfam")
			});
			var label_plfam = domConstruct.create("label", {innerHTML: " PATRIC genus-specific families (PLfams)<br/>"});
			domConstruct.place(rb_plfam.domNode, familyTypePanel.containerNode, "last");
			domConstruct.place(label_plfam, familyTypePanel.containerNode, "last");

			// pgfam
			var rb_pgfam = new RadioButton({
				name: "familyType",
				value: "pgfam"
			});
			rb_pgfam.on("click", function(){
				Topic.publish("ProteinFamilies", "familyType", "pgfam")
			});
			var label_pgfam = domConstruct.create("label", {innerHTML: " PATRIC cross-genus families (PGfams)<br/>"});
			domConstruct.place(rb_pgfam.domNode, familyTypePanel.containerNode, "last");
			domConstruct.place(label_pgfam, familyTypePanel.containerNode, "last");

			// figfam
			var rb_figfam = new RadioButton({
				name: "familyType",
				value: "figfam",
				checked: true
			});
			rb_figfam.on("click", function(){
				Topic.publish("ProteinFamilies", "familyType", "figfam")
			});
			var label_figfam = domConstruct.create("label", {innerHTML: " FIGFam"});
			domConstruct.place(rb_figfam.domNode, familyTypePanel.containerNode, "last");
			domConstruct.place(label_figfam, familyTypePanel.containerNode, "last");

			filterPanel.addChild(familyTypePanel);

			// genome list grid
			this.filterPanelGrid = new ProteinFamiliesFilterGrid({
				state: this.state
			});
			filterPanel.addChild(this.filterPanelGrid);

			//// other filter items
			var otherFilterPanel = new ContentPane({
				region: "bottom"
			});
			var ta_keyword = new TextArea({
				style: "width:215px; min-height:75px"
			});
			var label_keyword = domConstruct.create("label", {innerHTML: "Filter by one or more keywords"});
			domConstruct.place(label_keyword, otherFilterPanel.containerNode, "last");
			domConstruct.place(ta_keyword.domNode, otherFilterPanel.containerNode, "last");

			//
			domConstruct.place("<br>", otherFilterPanel.containerNode, "last");

			var rb_perfect_match = new RadioButton({
				name: "familyMatch",
				value: "perfect"
			});
			rb_perfect_match.on("click", function(){
				//Topic.publish()
			});
			var label_rb_perfect_match = domConstruct.create("label", {innerHTML: " Perfect Families (One protein per genome)<br/>"});
			domConstruct.place(rb_perfect_match.domNode, otherFilterPanel.containerNode, "last");
			domConstruct.place(label_rb_perfect_match, otherFilterPanel.containerNode, "last");

			var rb_non_perfect_match = new RadioButton({
				name: "familyMatch",
				value: "non_perfect"
			});
			rb_non_perfect_match.on("click", function(){
				//Topic.publish()
			});
			var label_rb_non_perfect_match = domConstruct.create("label", {innerHTML: " Non perfect Families<br/>"});
			domConstruct.place(rb_non_perfect_match.domNode, otherFilterPanel.containerNode, "last");
			domConstruct.place(label_rb_non_perfect_match, otherFilterPanel.containerNode, "last");

			var rb_all_match = new RadioButton({
				name: "familyMatch",
				value: "all_match",
				checked: true
			});
			rb_all_match.on("click", function(){
				//Topic.publish()
			});
			var label_rb_all_match = domConstruct.create("label", {innerHTML: " All Families<br/>"});
			domConstruct.place(rb_all_match.domNode, otherFilterPanel.containerNode, "last");
			domConstruct.place(label_rb_all_match, otherFilterPanel.containerNode, "last");

			var label_num_protein_family = domConstruct.create("label", {innerHTML: "Number of Proteins per Family<br/>"});
			var tb_num_protein_family_min = new TextBox({
				name: "numProteinFamilyMin",
				value: "",
				style: "width: 40px"
			});
			var tb_num_protein_family_max = new TextBox({
				name: "numProteinFamilyMax",
				value: "",
				style: "width:40px"
			});
			domConstruct.place(label_num_protein_family, otherFilterPanel.containerNode, "last");
			domConstruct.place(tb_num_protein_family_min.domNode, otherFilterPanel.containerNode, "last");
			domConstruct.place("<span> to </span>", otherFilterPanel.containerNode, "last");
			domConstruct.place(tb_num_protein_family_max.domNode, otherFilterPanel.containerNode, "last");

			var label_num_genome_family = domConstruct.create("label", {innerHTML: "Number of Genomes per Family<br/>"});
			var tb_num_genome_family_min = new TextBox({
				name: "numGenomeFamilyMin",
				value: "",
				style: "width: 40px"
			});
			var tb_num_genome_family_max = new TextBox({
				name: "numGenomeFamilyMax",
				value: "",
				style: "width:40px"
			});
			domConstruct.place("<br>", otherFilterPanel.containerNode, "last");
			domConstruct.place(label_num_genome_family, otherFilterPanel.containerNode, "last");
			domConstruct.place(tb_num_genome_family_min.domNode, otherFilterPanel.containerNode, "last");
			domConstruct.place("<span> to </span>", otherFilterPanel.containerNode, "last");
			domConstruct.place(tb_num_genome_family_max.domNode, otherFilterPanel.containerNode, "last");

			domConstruct.place("<br>", otherFilterPanel.containerNode, "last");
			var btn_submit = new Button({
				label: "Filter"
			});
			domConstruct.place(btn_submit.domNode, otherFilterPanel.containerNode, "last");

			filterPanel.addChild(otherFilterPanel);

			this.tabContainer = new TabContainer({region: "center", id: this.id + "_TabContainer"});

			var tabController = new StackController({
				containerId: this.id + "_TabContainer",
				region: "top",
				"class": "TextTabButtons"
			});

			this.proteinFamiliesGrid = new ProteinFamiliesGridContainer({
				title: "Table",
				content: "Protein Families Table",
				state: this.state,
				apiServer: this.apiServer
			});

			this.heatmap = new ProteinFamiliesHeatmapContainer({
				title: "Heatmap",
				content: "Heatmap"
			});

			this.proteinFamiliesMembersGrid = new ProteinFamiliesMembersGridContainer({
				id: 'pfMembersGrid',
				title: "", // hide tab
				content: "Protein Family Members",
				state: this.state
			});

			this.watch("state", lang.hitch(this, "onSetState"));

			this.tabContainer.addChild(this.proteinFamiliesGrid);
			this.tabContainer.addChild(this.heatmap);
			this.tabContainer.addChild(this.proteinFamiliesMembersGrid);
			this.addChild(tabController);
			this.addChild(this.tabContainer);
			this.addChild(filterPanel);

			this.inherited(arguments);
			this._firstView = true;
		}
	});
});