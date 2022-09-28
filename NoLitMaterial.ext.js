class NoLitMaterialExtension extends Autodesk.Viewing.Extension {

	constructor(viewer, options) {
		super(viewer, options);
		this.viewer = viewer;
		this.modelFragments = new Map();
		this.forwardMaterialReplacements = new Map();
		this.backwardMaterialReplacements = new Map();
	}
	async load() {
		if (!this.viewer) return false;

		this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, e => {
			const model = e.model;

			const fragments = [];

			const instanceTree = model.getInstanceTree();

			instanceTree.enumNodeFragments(instanceTree.getRootId(), x => { fragments.push(x) }, true);

			this.modelFragments.set(model.id, fragments);
		});

		this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
			const matman = this.viewer.impl.matman();
			const materials = matman._materials;

			for (const key in materials) {
				const material = materials[key];

				if (this.forwardMaterialReplacements.has(material.id))
					continue;

				const replacedMaterial = material.clone();
				replacedMaterial.reflectivity = 0;

				matman.addMaterial(`${key}-fresnel-off`, replacedMaterial);

				this.forwardMaterialReplacements.set(material.id, replacedMaterial);
				this.backwardMaterialReplacements.set(replacedMaterial.id, material);
			}
		});

		return true;
	}

	unload() {
		return true;
	}

	onToolbarCreated() {
		this.viewer.getSettingsPanel().addCheckbox(
			"appearance",
			"Fresnel Reflection",
			"Turn off all fresnel reflection effects",
			false,
			e => { this.toggleCheckbox(e) }
		);
	}

	toggleCheckbox(e) {
		const models = this.viewer.getVisibleModels();

		for (const model of models) {
			if (e && model.isConsolidated())
				model.unconsolidate();

			this.toggleMaterials(model, e);

			if (!(e || model.isConsolidated()))
				this.viewer.impl.consolidateModel(model);
		}
	}

	toggleMaterials(model, noLit) {
		const fragments = this.modelFragments.get(model.id);

		if (!fragments)
			return;

		const replacementMap = noLit ? this.forwardMaterialReplacements : this.backwardMaterialReplacements;

		const framentList = model.getFragmentList();

		for (const fragId of fragments) {
			const materialId = framentList.getMaterialId(fragId);

			const targetMaterial = replacementMap.get(materialId);

			framentList.setMaterial(fragId, targetMaterial);
		}

		this.viewer.impl.invalidate(true);
	}
}

Autodesk.Viewing.theExtensionManager.registerExtension('NoLitMaterialExtension', NoLitMaterialExtension);
