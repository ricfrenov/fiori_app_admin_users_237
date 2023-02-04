sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
    "use strict";

    var Formatter = {

        date: function (value) {

            var oConfiguration = sap.ui.getCore().getConfiguration();
            var oLocale = oConfiguration.getFormatLocale();
            var oPattern = "";

            if (oLocale === "pt-BR") {
                oPattern = "dd/MM/yyyy";
            } else {
                oPattern = "MM/dd/yyyy";
            }

            if (value) {
                var year = new Date(value).getFullYear();
                if (year === 9999) {
                    return "";
                } else {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        //style: "short"
                        pattern: oPattern
                        //short medium long or full
                    });
                    return oDateFormat.format(new Date(value));
                }

            } else {
                return value;
            }
        },

        //Apresentar o texto do status mediante a propriedade Status do model
        statusProduto: function (value) {

            var oBundle = this.getView().getModel("i18n").getResourceBundle();

            try {
                return oBundle.getText("status" + value);
            } catch (err) {
                return "";
            }

        },
        //Altera o estado (cor) do objectStatus mediante a propriedade Status do model
        statProduto: function (value) {

            try {
                //statusE = Em Estoque
                //statusP = Em Produção
                //statusF = Fora de Estoque

                if (value === "E") {
                    return "Success";
                } else if (value === "P") {
                    return "Information";
                } else if (value === "F") {
                    return "Error";
                } else {
                    return "None";
                }
            } catch (err) {
                return "None";
            }

        },
        //Altera o icone correspondente mediante a propriedade Status do model
        iconProduto: function (value) {

            try {
                //statusE = Em Estoque
                //statusP = Em Produção
                //statusF = Fora de Estoque

                if (value === "E") {
                    return "sap-icon://sys-enter-2";
                } else if (value === "P") {
                    return "sap-icon://alert";
                } else if (value === "F") {
                    return "sap-icon://error";
                } else {
                    return "";
                }
            } catch (err) {
                return "";
            }

        },
            //Apresentar os valores numéricos formatados tipo decimal
            floatNumber: function (value) {

                var numFloat = NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    minFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: ".",
                    decimalSeparator: ","
                });

                return numFloat.format(value);
            },
            dateSAP: function (value) {

                if (value) {
                    debugger;
                    var dateParts = value.split("/");
                    var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        //pattern: "yyyy-MM-ddTHH:mm:ss"
                       // pattern: "yyyy-mm-ddThh:mm:ss"
                       //AAAAMMDDhhmmss
                       pattern: "yyyy-MM-ddTHH:mm:ss"
                    });
                    return oDateFormat.format(new Date(dateObject));
                } else {
                    return value;
                }

            },
    };

    return Formatter;

}, true);

