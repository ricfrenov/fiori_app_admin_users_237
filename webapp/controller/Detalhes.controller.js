sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "br/com/gestao/fioriappadmin237/util/Formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/gestao/fioriappadmin237/util/Validator",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Formatter, Fragment, JSONModel, ODataModel, MessageToast, Filter, FilterOperator, Validator, ValueState, MessageBox, BusyDialog) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappadmin237.controller.Detalhes", {

            objFormatter: Formatter,
            //Criar o meu objeto  Router  e acoplar a função que fará o bindingElement
            onInit: function () {
                debugger;
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success);
                });

                //CriandO o Objeto Route e acoplando a função que fará o BindingElement
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Detalhes").attachMatched(this.onBindingProdutoDetalhes, this);
                debugger;
                //1 - chamar a função onde irá fazer o carregamento dos fragments iniciais
                this._formFragments = {};
                this._showFormFragments("DisplayBasicInfo", "vboxviewBasicInform");
                this._showFormFragments("DisplayTechInfo", "vboxviewTechInform");

            },

            //2 - Recebe como parametro o nome do Fragment e o nome do VBox de destino
            _showFormFragments: function (sFragmentName, sVBoxName) {

                var objVBox = this.byId(sVBoxName);
                objVBox.removeAllItems();

                this._getFormAllItems(sFragmentName).then(function (oVBox) {
                    objVBox.insertItem(oVBox);
                });

            },

            // 3 - Cria o Objeto Fragment baseado no Nome e adiciona em um objeto com uma coleçãp de fragments
            _getFormAllItems: function (sFragmentName) {

                var oFormFragment = this._formFragments[sFragmentName];
                var oView = this.getView();

                if (!oFormFragment) {
                    oFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappadmin237.frags." + sFragmentName,
                        Controller: this
                    });
                    this._formFragments[sFragmentName] = oFormFragment;
                }
                return oFormFragment;

            },
            onBindingProdutoDetalhes: function (oEvent) {
                //Capturando o parametro trafegado no Router Detalhes (productId)
                var oProduto = oEvent.getParameter("arguments").productId;

                //Objeto referente a View Detalhes
                var oView = this.getView();

                //Criar um parametro de controle para redirecionamento da view após o delete
                this._bDelete = false;

                //Criar a url de chama da entidade Produtos
                var sUrl = "/Produtos('" + oProduto + "')"

                //Fazer o Binding Element
                oView.bindElement({
                    path: sUrl,
                    parameters: { expand: 'to_cat' },
                    events: {
                        change: this.onBindingChange.bind(this),
                        dataRequested: function () {
                            debugger;
                            oView.setBusy(true);
                        },
                        dataReceived: function (data) {
                            debugger;
                            oView.setBusy(false);
                        }

                    }
                });
            },
            onBindingChange: function (oEvent) {
                debugger;
                var oView = this.getView();
                var oElementBinding = oView.getElementBinding();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                //Se não existir um elemento ou registro válido faz ação de direcionar para uma nova view
                if (!oElementBinding.getBoundContext()) {
                    //Se não existir o registro e não estamos na operação de delete nós fazemos o redirecionamento
                    if (!this._bDelete) {
                        oRouter.getTargets().display("objNotFound");
                        return;
                    }

                } else {
                    //Clonamos o registro atual
                    this._oProduto = Object.assign({}, oElementBinding.getBoundContext().getObject());
                }
            },

            onCriarModel: function () {
                //Model Produto
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_Produto");

            },

            onNavBack: function () {

                //Desabilitar a edição através de uma nova função. Ficar somente leitura
                this._habilitaEdicao(false);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Lista");
            },

            handleEditPress: function () {
                debugger;
                //Criamos model de produto
                this.onCriarModel();

                this.onBindingChange(this);

                //\Atribui no objeto model o registro clonado
                var oModelProduto = this.getView().getModel("MDL_Produto");
                oModelProduto.setData(this._oProduto);

                this.onGetUsuarios();

                //Habilitar a edição através de uma nova função
                this._habilitaEdicao(true);

            },

            handleCancelPress: function () {
                //Restaurar o registro atual do Model
                var oModel = this.getView().getModel()
                oModel.refresh(true);

                //voltanos para somente leitura
                this._habilitaEdicao(false);
            },

            _habilitaEdicao: function (bEdit) {
                var oView = this.getView();
                debugger;

                //botões de ações
                oView.byId("btnEdit").setVisible(!bEdit);
                oView.byId("btnDelete").setVisible(!bEdit);
                oView.byId("btnSave").setVisible(bEdit);
                oView.byId("btnCancel").setVisible(bEdit);

                //Habilitar ou desabilitar as abas ou as seções
                oView.byId("_IDGenObjectPageSection1").setVisible(!bEdit);
                oView.byId("_IDGenObjectPageSection2").setVisible(!bEdit);
                oView.byId("_IDGenObjectPageSection3").setVisible(bEdit);

                if (bEdit) {
                    this._showFormFragments("Change", "vboxChangeProduct");
                } else {
                    this._showFormFragments("DisplayBasicInfo", "vboxviewBasicInform");
                    this._showFormFragments("DisplayTechInfo", "vboxviewTechInform");
                }
            },
            //Capturar a coleção de usuários de um novo serviço OData
            onGetUsuarios: function () {

                var t = this;
                var strEntity = "/sap/opu/odata/sap/ZSB_USERS_237";

                //Realizar a chamada para o SAP
                var oModelSend = new ODataModel(strEntity, true);

                oModelSend.read("/Usuarios", {
                    success: function (oData, results) {
                        if (results.statusCode === 200) { //Sucesso do Get
                            var oModelUsers = new JSONModel();
                            oModelUsers.setData(oData.results);
                            t.getView().setModel(oModelUsers, "MDL_Users");
                        }
                    },
                    error: function (e) {
                        var oRet = JSON.parse(e.response.body);
                        MessageToast.show(oRet.error.message.value, {
                            duration: 4000
                        });
                    }
                });
            },
            onCategoria: function (oEvent) {
                debugger;
                this._oInput = oEvent.getSource().getId();
                var oView = this.getView();

                //Verifico se o objeto Fragment existe se não crio e adiciono na View
                if (!this._CategoriaSearchHelp) {
                    this._CategoriaSearchHelp = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappadmin237.frags.SH_Categorias",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                };
                this._CategoriaSearchHelp.then(function (oDialog) {

                    //Limpando o filtro a abertura do fragment o filtro de categorias
                    oDialog.getBinding("items").filter([]);

                    //faz a abertura do fragment
                    oDialog.open();
                });
            },
            onValueHelpSearch: function (oEvent) {

                //debugger;
                //Capturando o valor digitado pelo usuário 
                var sValue = oEvent.getParameter("value");

                //Opção 1 que eu crio um unico objeto filtro
                //Criando um objeto do tipo Filter que irá receber o valor e associar na propriedade description
                /*var oFilter = new Filter("Description", FilterOperator.Contains, sValue);
                oEvent.getSource().getBinding("items").filter([oFilter]);*/

                //Opção 2 onde podemos criar um objeto que ele pode ser dinamico onde adiciono varias propriedades
                var objFilter = { filters: [], and: false };
                objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
                objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));

                var oFilter = new Filter(objFilter);
                oEvent.getSource().getBinding("items").filter(oFilter);

            },

            onValueHelpClose: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oInput = null;

                if (this.byId(this._oInput)) {
                    oInput = this.byId(this._oInput);
                } else {
                    oInput = sap.ui.getCore().byId(this._oInput);
                }

                if (!oSelectedItem) {
                    oInput.resetProperty("value");
                    return;
                }
                oInput.setValue(oSelectedItem.getTitle());
            },

            getSupplier: function (evt) {

                debugger;

                this._oInput = evt.getSource().getId();
                var oValue = evt.getSource().getValue();

                //URL de chamada de um Fornecedor
                var sElement = "/Fornecedores('" + oValue + "')";

                //Cria o objeto model default
                var oModel = this.getView().getModel();

                //model onde o Usuário realiza o preenchimento das informações de produto
                var oModelProduto = this.getView().getModel("MDL_Produto");

                //Realizar a chamada para o SAP
                var oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {
                    success: function (oData, results) {
                        if (results.statusCode === 200) { //Sucesso do Get
                            oModelProduto.setProperty("/Supplierid", oData.Lifnr);
                            oModelProduto.setProperty("/Suppliername", oData.Name1);
                        }
                    },
                    error: function (e) {

                        oModelProduto.setProperty("/Supplierid", "");
                        oModelProduto.setProperty("/Suppliername", "");

                        var oRet = JSON.parse(e.response.body);
                        MessageToast.show(oRet.error.message.value, {
                            duration: 4000
                        });
                    }
                });

            },
            onSuggest: function (evt) {

                debugger;

                var sText = evt.getParameter("suggestValue");
                var aFilters = [];

                if (sText) {
                    aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
                }

                evt.getSource().getBinding("suggestionItems").filter(aFilters);

            },

            onValida: function () {

                //Criação do Objeto Validator
                var oValidator = new Validator();

                //Chama a validação
                if (oValidator.validate(this.byId("vboxChangeProduct"))) {
                    this.onUpdate();
                }
            },

            onUpdate: function () {
                debugger;
                //1 - Criando uma referência do objeto model que está recebendo as informações do fragemnt
                var oModel = this.getView().getModel("MDL_Produto");
                var objUpdate = oModel.getData();
                var sPath = this.getView().getElementBinding().getPath();

                //2 - Manipular propriedades
                //objUpdate.Productid = this.geraID();
                // objUpdate.Productid = objUpdate.Productid.toString();
                objUpdate.Price = objUpdate.Price.toString();
                objUpdate.Weightmeasure = objUpdate.Weightmeasure.toString();
                objUpdate.Width = objUpdate.Width.toString();
                objUpdate.Depth = objUpdate.Depth.toString();
                objUpdate.Height = objUpdate.Height.toString();
                //objUpdate.Createdat = this.objFormatter.dateSAP(objUpdate.Createdat);
                //objUpdate.Currencycode = "BRL";
                //objUpdate.Userupdate = "";
                debugger;
                objUpdate.Changedat = new Date().toISOString().substring(0, 19);

                delete objUpdate.to_cat;
                delete objUpdate.__metadata;

                //3 -   Criando uma referência do arquivo i18n
                var oBundle = this.getView().getModel("i18n").getResourceBundle();

                //Variável contexto da View
                var t = this;

                // 4 - Criar o objeto model referencia do model default (OData)
                var oModelProduto = this.getView().getModel();

                //5 - Implementar mensagem(MessageBox) para apresentar ao usuário
                MessageBox.confirm(
                    oBundle.getText("updateDialogMsg", [objUpdate.Productid]), //pergunta para processo
                    function (oAction) { //Função de disparo do insert

                        debugger

                        //Verificando se o usuário confirmou ou cancelou a operação
                        if (MessageBox.Action.OK === oAction) {

                            //Cria um BusyDialog
                            t._oBusyDialog = new BusyDialog({
                                text: oBundle.getText("sending")
                            });

                            t._oBusyDialog.open();

                            setTimeout(function () {
                                debugger;
                                //Realizar a chamada para o SAP
                                var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);
                                oModelSend.update(sPath, objUpdate, null,
                                    function (d, r) {  //Função de retorno Sucesso

                                        if (r.statusCode === 204) { //Sucesso no Update

                                            //Fechar o BusyDialog
                                            t._oBusyDialog.close();

                                            MessageBox.success(oBundle.getText("updateDialogSuccess", [objUpdate.Productid]));

                                            //Voltar para somente leitura
                                            t.handleCancelPress();

                                        }

                                    }, function (e) { //Função de retorno Erro

                                        //Fechar o BusyDialog
                                        t._oBusyDialog.close();

                                        //Converter corpo da mensagem de erro
                                        /*
                                        try {
                                            let $message = e.response.body;
                                            //sap.m.MessageBox.error($message);
                                            MessageToast.show($message, {
                                                duration: 4000       
                                                        });
                                            } catch {};
                                            */
                                        var oRet = JSON.parse(e.response.body);
                                        MessageToast.show(oRet.error.message.value, {
                                            duration: 4000
                                        });

                                    });
                            }, 2000);
                        }
                    },
                    oBundle.getText("updateDialogTitle"), //Titulo do Dialog
                );
            },
            onDelete: function () {

                debugger;

                var objDelete = this.getView().getElementBinding().getBoundContext().getObject();
                var sPath = this.getView().getElementBinding().getPath();
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var t = this;
                var oModelProduto = this.getView().getModel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                MessageBox.confirm(
                    oBundle.getText("deleteDialogMsg", [objDelete.Productid]), //pergunta para processo
                    function (oAction) { //Função de disparo do insert

                        debugger

                        //Verificando se o usuário confirmou ou cancelou a operação
                        if (MessageBox.Action.OK === oAction) {

                            //Cria um BusyDialog
                            t._oBusyDialog = new BusyDialog({
                                text: oBundle.getText("sending")
                            });

                            t._oBusyDialog.open();

                            setTimeout(function () {
                                debugger;
                                //Realizar a chamada para o SAP
                                var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);
                                oModelSend.remove(sPath, {

                                    success: function (d, r) {  //Função de retorno Sucesso

                                        if (r.statusCode === 204) { //Sucesso no Delete

                                            //Fechar o BusyDialog
                                            t._oBusyDialog.close();

                                            //setar o paramtero de delete
                                            t._bDelete = true;

                                            //MessageBox.success(oBundle.getText("deleteDialogSuccess", [objUpdate.Productid]));

                                            MessageBox["information"](oBundle.getText("deleteDialogSuccess", [objDelete.Productid]), {
                                                actions: [MessageBox.Action.OK],
                                                onclose: function (oAction) {
                                                    if (oAction === MessageBox.Action.OK) {
                                                        t.getView().getModel().refresh();
                                                        oRouter.navTo("Lista");
                                                    }
                                                }.bind(this)
                                            });

                                            //Voltar para somente leitura
                                            t.handleCancelPress();

                                        }

                                    },
                                    error: function (e) { //Função de retorno Erro

                                        //Fechar o BusyDialog
                                        t._oBusyDialog.close();

                                        //Converter corpo da mensagem de erro
                                        var oRet = JSON.parse(e.response.body);
                                        MessageToast.show(oRet.error.message.value, {
                                            duration: 4000
                                        });
                                    }
                                });
                            }, 4000);
                        }
                    },
                    oBundle.getText("deleteDialogTitle"), //Titulo do Dialog
                );
            },
        });
    });
