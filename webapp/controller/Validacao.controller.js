sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ValueState, JSONModel){ 
        "use strict";

        return Controller.extend("br.com.gestao.fioriappusers237.controller.Validacao", { 
            onInit: function () {

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success);
                });

                //Model de apoio
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_Produto");

            },
            onVerModel: function(){
                var oModel = this.getView().getModel("MDL_Produto");
                console.log(oModel.getData());
            }
            
        });
    });
