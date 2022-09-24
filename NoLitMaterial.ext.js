class NoLitMaterialExtension extends Autodesk.Viewing.Extension {

    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
    }
    async load() {
    	if (!this.viewer) return false;

    	viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () =>{
			this.viewer.getSettingsPanel().addCheckbox(
				"appearance",
				"Fresnel Reflection",
				"Turn off all fresnel reflection effects",
				false,
				e => {this.toggleCheckbox(e)}
			);    		
    	})
	    return true;
    }

    unload() {
        return true;
    }

    toggleCheckbox(e) {
    	const mm = this.viewer.impl.matman()._materials;
		Object.keys(mm).map( a => { 
			if (e) {
				localStorage.setItem(a, mm[a].reflectivity);
				mm[a].reflectivity = 0;
			} else {
				mm[a].reflectivity = (localStorage.getItem(a));
			}
		})

		this.viewer.impl.invalidate(true);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('NoLitMaterialExtension', NoLitMaterialExtension);
