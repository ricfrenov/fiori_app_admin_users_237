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

        return Controller.extend("br.com.gestao.fioriappusers237.controller.Objetos", { 
            onInit: function () {

            },
            onClicaSet: function(evt){
                debugger;
                var objTitle = this.getView().byId("headerTitle");
                objTitle.setText("Novo Titulo do Header");
                
            },
            onClicaGet: function(evt){
                debugger;
                var objTitle = this.getView().byId("headerTitle");
                var sValorText = objTitle.getText();
                
            },
            addFormulario: function(evt){
                debugger;

                //Estamos criando uma referencia do objeto Panel
                var objPanel = this.getView().byId("panel_formulario");
                
                //Chama o metodo para eliminar todo o conteudo do Panel
                objPanel.destroyContent();

                //Criando os objetos do Formulário
                var objItensFormulario=[];
                objItensFormulario.push( new Label("lblPergunta1", { 
                    text: "Pergunta 1",
                    required: true
                }) );

                objItensFormulario.push( new Input("inputPergunta1", { 
                    value: "Valor da Pergunta 1"
                     
                }) );
                
                objItensFormulario.push( new Label("lblPergunta2", { 
                    text: "Pergunta 2",
                    required: false
                }) );

                objItensFormulario.push ( new TextArea("txtArea", {
                    rows: 7
                }));


                //Criar um SimpleForm
                var oForm = new SimpleForm("simpleForm", {
                    content: objItensFormulario
                });

                //Adicionar o formulário dentro do Panel
                objPanel.addContent(oForm);

            }
        });
    });
