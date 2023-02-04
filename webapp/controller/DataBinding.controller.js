sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/ui/layout/form/SimpleForm"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Label, Input, TextArea, SimpleForm) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappusers237.controller.DataBinding", { 
            onInit: function () {
                var ObjModelJSON = new sap.ui.model.json.JSONModel();
                ObjModelJSON.loadData("dados/Produtos.json");
                this.getView().setModel(ObjModelJSON, "Model_JSON_Produtos");
            },

            getRegion: function(){
                var ObjRegionModel = new sap.ui.model.json.JSONModel();
                ObjRegionModel.loadData("dados/Regions.json");
                this.getView().setModel(ObjRegionModel, "Model_JSON_Regions");

                var objFormulario = this.getView().byId("form_regions");
                objFormulario.bindElement("Model_JSON_Regions>/regions/0");

            }
            
        });
    });
