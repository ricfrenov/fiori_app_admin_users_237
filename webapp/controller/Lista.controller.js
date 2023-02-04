sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "br/com/gestao/fioriappusers237/util/Formatter",
    "br/com/gestao/fioriappusers237/util/Validator",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, Formatter, Validator, ValueState, MessageBox, BusyDialog, ODataModel, MessageToast, Fragment) {
        "use strict";

        return Controller.extend("br.com.gestao.fioriappusers237.controller.Lista", {
            objFormatter: Formatter,
            //Criar o meu objeto  Router  e acoplar a função que fará o bindingElement
            onInit: function () {

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success);
                });

                //var oConfiguration = sap.ui.getCore().getConfiguration();
                //oConfiguration.setFormatLocale("pt-BR");

            },

            onCriarModel: function () {
                //Model Produto
                var oModel = new JSONModel();
                this.getView().setModel(oModel, "MDL_Produto");

            },
            onSearch: function () {

                debugger;
                //Capturando individualmente cada objeto Input do Objeto Filter Bar
                var oProdutoInput = this.getView().byId("productIdInput");
                var oProdutoNomeInput = this.getView().byId("productNameInput");
                var oProdutoCategoriaInput = this.getView().byId("productCategoryInput");

                var objFilter = { filters: [], and: true };
                objFilter.filters.push(new Filter("Productid", FilterOperator.Contains, oProdutoInput.getValue()));
                objFilter.filters.push(new Filter("Name", FilterOperator.Contains, oProdutoNomeInput.getValue()));
                objFilter.filters.push(new Filter("Category", FilterOperator.Contains, oProdutoCategoriaInput.getValue()));

                var oFilter = new Filter(objFilter);

                //Criação do Objeto list e acesso a agregação items onde sabemos qual a entidade onde será aplicado o filtro
                var oTable = this.getView().byId("tableProdutos");
                var binding = oTable.getBinding("items");

                //é aplicado o filtro para o data Binding
                binding.filter(oFilter);

            },
            onRouting: function () {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes");

            },

            onSelectedItem: function (evt) {

                //Se o model tiver um nome é necessário colocar o nome do model dentro da instrução: getBindingContext("Nome_do_model")
                debugger;
                // 1 - Captura do valor do produto
                var oProductID = evt.getSource().getBindingContext().getProperty("Productid");

                //2 - O envio para o Route com detalhes de parametro
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Detalhes", {
                    productId: oProductID
                });

            },

            onCategoria: function (oEvent) {
                //debugger;
                this._oInput = oEvent.getSource().getId();
                var oView = this.getView();

                //Verifico se o objeto Fragment existe se não crio e adiciono na View
                if (!this._CategoriaSearchHelp) {
                    this._CategoriaSearchHelp = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappusers237.frags.SH_Categorias",
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

            onNovoProduto: function (oEvent) {

                //Criar o Model Produto
                this.onCriarModel();
                var oView = this.getView();
                var t = this;

                //Verifico se o objeto Fragment existe se não crio e adiciono na View

                if (!this._Produto) {
                    this._Produto = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.gestao.fioriappusers237.frags.Insert",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._Produto.then(function (oDialog) {
                    //faz a abertura do fragment
                    oDialog.open();
                    debugger;
                    //Chamada da função para pegar os usuários
                    t.onGetUsuarios();
                    //t.getReadOpcoes();
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

            onValida: function () {

                //Criação do Objeto Validator
                var oValidator = new Validator();

                //Chama a validação
                if (oValidator.validate(this.byId("_IDGenDialog1"))) {
                    this.onInsert();
                }
            },
            onInsert: function () {
                debugger;
                //1 - Criando uma referência do objeto model que está recebendo as informações do fragemnt
                var oModel = this.getView().getModel("MDL_Produto");
                var objNovo = oModel.getData();

                //2 - Manipular propriedades
                objNovo.Productid = this.geraID();
                // objNovo.Productid = objNovo.Productid.toString();
                objNovo.Price = objNovo.Price[0].toString();
                objNovo.Weightmeasure = objNovo.Weightmeasure.toString();
                objNovo.Width = objNovo.Width.toString();
                objNovo.Depth = objNovo.Depth.toString();
                objNovo.Height = objNovo.Height.toString();
                objNovo.Createdat = this.objFormatter.dateSAP(objNovo.Createdat);
                objNovo.Currencycode = "BRL";
                objNovo.Userupdate = "";

                //3 -   Criando uma referência do arquivo i18n
                var oBundle = this.getView().getModel("i18n").getResourceBundle();

                //Variável contexto da View
                var t = this;

                // 4 - Criar o objeto model referencia do model default (OData)
                var oModelProduto = this.getView().getModel();

                //5 - Implementar mensagem(MessageBox) para apresentar ao usuário
                MessageBox.confirm(
                    oBundle.getText("insertDialogMsg"), //pergunta para processo
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
                                oModelSend.create("Produtos", objNovo, null,
                                    function (d, r) {  //Função de retorno Sucesso

                                        if (r.statusCode === 201) { //Sucesso na criação
                                            MessageToast.show(oBundle.getText("insertDialogSuccess", [objNovo.Productid]), {
                                                duration: 4000
                                            });

                                            //Iremos fechar oobjeto Dialog do Fragment
                                            t.onDialogClose();

                                            //dar um refresh no model default
                                            t.getView().getModel().refresh();

                                            //Fechar o BusyDialog
                                            t._oBusyDialog.close();

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
                    oBundle.getText("insertDialogTitle"), //Titulo do Dialog
                );
            },
            //gerar um id de produto dinamicamente
            geraID: function () {
                debugger;
                return 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {

                    var r = Math.random() * 16 | 0,

                        v = c == 'x' ? r : (r & 0x3 | 0x8);

                    return v.toString(16).toUpperCase();

                });

            },
            //Fechamento do Dialog do fragment
            onDialogClose: function () {
                this._Produto.then(function (oDialog) {
                    //faz o fechamento do fragment
                    oDialog.close();
                });
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
            //Localizar um fornecedor baseado no input do usuário
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

            //Aplicar um filtro na entidade fornecedores 
            onSuggest: function (evt) {

                debugger;

                var sText = evt.getParameter("suggestValue");
                var aFilters = [];

                if (sText) {
                    aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText));
                }

                evt.getSource().getBinding("suggestionItems").filter(aFilters);

            },
            getReadOpcoes: function () {

                debugger;

                // Item 1 - Chamada via URL

                var sElement = "/Produtos";

                //var sElement = "/Produtos('322E3BBF5A')";

                //var sElement = "/Produtos('322E3BBF5A')/to_cat";

                var afilters = [];

                afilters.push(new Filter("Status", FilterOperator.EQ, 'P'));

                afilters.push(new Filter("Category", FilterOperator.EQ, 'CATE'));

                // Cria o objeto model default 

                var oModel = this.getView().getModel();

                // Realizar a chamada para o SAP

                var oModelSend = new ODataModel(oModel.sServiceUrl, true);

                oModelSend.read(sElement, {

                    filters: afilters,

                    urlParameters: {

                        $expand: "to_cat"

                    },

                    success: function (oData, results) {

                        if (results.statusCode === 200) { // Sucesso do Get

                        }

                    },

                    errors: function (e) {

                        var oRet = JSON.parse(e.response.body);

                        MessageToast.show(oRet.error.message.value, {

                            duration: 4000

                        });
                    }
                });
            }
        });
    });
