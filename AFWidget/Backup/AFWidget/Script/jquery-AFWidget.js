$.widget("ui.AFGrid", {
    options: {
        Title: "",//表格头
        HeadRow: "",//表格头html模板
        InsertRow: "",//插入行html模板
        TotalRow: "",//合计行html模板
        DataSource: "",//数据源
        ArrayDelimiter: ";",//数据行分隔符
        FieldDelimiter: "#",//数据列分隔符
        IsReadOnly: false,//是否只读
        IsAdd: false,//在为插件对象重新指定数据源时该选项用于指示是否清空表格中原有的数据，true不清空，false清空
        /*call backs*/
        Change: null, //编辑表格后blur事件触发的方法，参数（jquery对象）{calculateRow：合计行Tr，contentBody明细表格Tbody，currentRow：当前行Tr}
        Validate: null, //编辑表格后blur事件触发的方法（此方法首先触发，返回true时，随后触发Change方法），参数（jquery对象）{currentRow：当前行Tr}
        InsertRowCalculate: null, //点击插入新行click事件触发的方法，参数（jquery对象）{insertRow：插入行Tr}
        TableCalculate: null//明细表格计算，参数（jquery对象）{calculateRow：合计行Tr，contentBody明细表格Tbody}
    },
    _create: function () {
        $this = this;
        this.trTitleEle = $("<tr id='tr_Title' align='center' class='theme'></tr>").appendTo(this.element);
        this.trSelectEle = $("<tr id='tr_Select'></tr>").appendTo(this.element);
        this.trContentEle = $("<tr id='tr_Content'></tr>").appendTo(this.element);
        this.trEditEle = $("<tr id='tr_Edit'></tr>").appendTo(this.element);
        //trTitle
        this.trTitleTdEle = $("<td colspan='9999'>" + this.options.Title + "</td>").appendTo(this.trTitleEle);
        //trSelect
        this.trSelectTdEle = $("<td colspan='9999'></td>").appendTo(this.trSelectEle);
        if (this.options.IsReadOnly) {
            this.trSelectTdEle.hide();
        }
        if (!this.options.IsReadOnly) {
            this.trSelectA_AllEle = $("<a href='#'>全选</a>").appendTo(this.trSelectTdEle);
            this.trSelectA_ExceptEle = $("<a href='#'>反选</a>").appendTo(this.trSelectTdEle);
            this.trSelectA_DelEle = $("<a href='#'>删除</a>").appendTo(this.trSelectTdEle);
            //全选
            this._on(this.trSelectA_AllEle, { "click": function (event) { this.trContentTdTableBodyEle.find("input[type='checkbox']").prop("checked", true); } });
            //反选
            this._on(this.trSelectA_ExceptEle, { "click": function (event) {
                this.trContentTdTableBodyEle.find("input[type='checkbox']").each(function (i, n) {
                    if ($(n).prop("checked")) { $(n).prop("checked", false); } else { $(n).prop("checked", true); }
                });
            }
            });
            //删除
            this._on(this.trSelectA_DelEle, { "click": function (event) {
                this.trContentTdTableBodyEle.find("input[type = 'checkbox']").each(function (i, n) {
                    if ($(n).prop("checked")) {
                        $(n).parent().parent().remove();
                    }
                });
                this._trigger("TableCalculate", null, { calculateRow: this.TotalRowEle, contentBody: this.trContentTdTableBodyEle });
            }
            });
        }
        //trEdit
        this.trEditTdEle = $("<td></td>").appendTo(this.trEditEle);
        this.trEditTdTableEle = $("<table width='100%' border='1'></table>").appendTo(this.trEditTdEle);
        this.TotalRowEle = $(this.options.TotalRow).appendTo(this.trEditTdTableEle);
        this.InsertRowEle = $(this.options.InsertRow).appendTo(this.trEditTdTableEle);
        var insertTdTotal = this.InsertRowEle.find("td").length - 1;
        this.importRowEle = $("<tr></tr>").appendTo(this.trEditTdTableEle);
        $("<td><a href='#'>导入</a></td><td colspan='" + insertTdTotal + "'><input type='file'/><a href='#'>下载模版</a></td>").appendTo(this.importRowEle);
        this.InsertRowEle.find("input[type='text'][class='thousandSeparator']").on("blur", function (event) {
            if ($(event.target).val() !== "") {
                addThousandSeparator($(event.target));
                if ($this._trigger("Validate", event, { currentRow: $this.InsertRowEle }) !== false) {
                    $this._trigger("InsertRowCalculate", event, { insertRow: $this.InsertRowEle });
                }
                $(event.target).css("borderColor", "");
            }
            else {
                $(event.target).css("borderColor", "Red");
                event.preventDefault();
            }
        });
        if (this.options.IsReadOnly) {
            this.InsertRowEle.hide();
        }
        if (!this.options.IsReadOnly) {
            //插入
            this._on(this.InsertRowEle.find("a").first(), { "click": function (event) {
                if (this._trigger("Validate", event, { currentRow: this.InsertRowEle }) !== false) {
                    if (this._trigger("InsertRowCalculate", event, { insertRow: this.InsertRowEle }) !== false) {
                        var $tempTr = $(this.options.InsertRow);
                        $tempTr.find("input[type='text']").on("blur", function (event) {
                            if ($(event.target).val() !== "") {
                                if ($(event.target).attr("class") === "thousandSeparator") {
                                    addThousandSeparator($(event.target));
                                }
                                $this._trigger("Change", event, { calculateRow: $this.TotalRowEle, contentBody: $this.trContentTdTableBodyEle, currentRow: $(event.target).parent().parent() });
                                $(event.target).css("borderColor", "");
                            }
                            else {
                                $(event.target).css("borderColor", "Red");
                                event.preventDefault();
                            }
                        });
                        $tempTr.find("select").on("change", function (event) {
                            if ($(event.target).val() !== "0") {
                                $this._trigger("Change", event, { calculateRow: $this.TotalRowEle, contentBody: $this.trContentTdTableBodyEle, currentRow: $(event.target).parent().parent() });
                                $(event.target).css("borderColor", "");
                            }
                            else {
                                $(event.target).css("borderColor", "Red");
                                event.preventDefault();
                            }
                        });

                        $tempTr.find("td:first-child").html("<input type='checkbox'/>");
                        this.InsertRowEle.find("td").each(function (index, ele) {
                            if (index > 0) {
                                $tempTr.find("td:eq(" + index + ")").children().first().val($(ele).children().first().val());
                            }
                        });
                        $tempTr.appendTo(this.trContentTdTableBodyEle);
                        this._trigger("TableCalculate", null, { calculateRow: this.TotalRowEle, contentBody: this.trContentTdTableBodyEle });
                    }
                }
            }
            });
        }
        //trContent
        this.trContentTdEle = $("<td></td>").appendTo(this.trContentEle);
        this.trContentTdTableEle = $("<table width='100%' border='1'></table>").appendTo(this.trContentTdEle);
        this.trContentTdTableHeadEle = $("<thead></thead>").appendTo(this.trContentTdTableEle);
        this.trContentTdTableBodyEle = $("<tbody></tbody>").appendTo(this.trContentTdTableEle);
        this.trContentTdTableHeadRowEle = $(this.options.HeadRow).appendTo(this.trContentTdTableHeadEle);
        this.setContent();
    },
    _refresh: function () {
        if (this.options.IsReadOnly) {
            this.trSelectTdEle.hide();
            this.InsertRowEle.hide();
        }
        else {
            this.trSelectTdEle.show();
            this.InsertRowEle.show();
        }
        this.setContent();
    },
    _setOptions: function () {
        this._superApply(arguments);
        this._refresh();
    },
    _setOption: function (key, value) {
        this._super(key, value);
    },
    setContent: function () {
        $this = this;
        if (this.options.DataSource.length > 0) {
            if (!this.options.IsAdd) {
                this.trContentTdTableBodyEle.empty();
            }
            var arrTr = this.options.DataSource.split(this.options.ArrayDelimiter);
            for (var tr in arrTr) {
                if (arrTr[tr].length > 0) {
                    var $tempTr = $(this.options.InsertRow);
                    $tempTr.find("input[type='text']").on("blur", function (event) {
                        if ($(event.target).val() !== "") {
                            if ($(event.target).attr("class") === "thousandSeparator") {
                                addThousandSeparator($(event.target));
                            }
                            $this._trigger("Change", event, { calculateRow: $this.TotalRowEle, contentBody: $this.trContentTdTableBodyEle, currentRow: $(event.target).parent().parent() });
                            $(event.target).css("borderColor", "");
                        }
                        else {
                            $(event.target).css("borderColor", "Red");
                            event.preventDefault();
                        }
                    });

                    $tempTr.find("select").on("change", function (event) {
                        if ($(event.target).val() !== "0") {
                            $this._trigger("Change", event, { calculateRow: $this.TotalRowEle, contentBody: $this.trContentTdTableBodyEle, currentRow: $(event.target).parent().parent() });
                            $(event.target).css("borderColor", "");
                        }
                        else {
                            $(event.target).css("borderColor", "Red");
                            event.preventDefault();
                        }
                    });
                    $tempTr.find("td:first-child").html("<input type='checkbox'/>");
                    if (this.options.IsReadOnly) {
                        $tempTr.find("td:first-child").html("");
                    }
                    var con = arrTr[tr].split(this.options.FieldDelimiter);
                    for (var i = 1; i <= con.length; i++) {
                        var $element = $tempTr.find("td:eq(" + i + ")").children().first();
                        $element.val(con[i - 1]);
                        if ($element.attr("class") === "thousandSeparator") {
                            $element.val(getValueWithThousandSeparator(con[i - 1]));
                        }
                        if (this.options.IsReadOnly) {
                            $element.attr("disabled", "disabled");
                            if ($element.attr("class") === "Wdate") {
                                $element.unbind();
                            }
                        }
                    }
                    $tempTr.appendTo(this.trContentTdTableBodyEle);
                }
            }
            this._trigger("TableCalculate", null, { calculateRow: this.TotalRowEle, contentBody: this.trContentTdTableBodyEle });
        }
    }
});

function getFloatValue(value) {
    if (value != null && value != "") {
        if (!isNaN(value) && Math.abs(value) != Infinity) {
            return parseFloat(value).toFixed(2);
        }
        else {
            value = value.toString().replace(/,/g, "");
            if (!isNaN(value) && Math.abs(value) != Infinity) {
                return parseFloat(value).toFixed(2);
            }
        }
    }
    return parseFloat(0);
}

function getValueWithThousandSeparator(s) {//添加千位符  
    s = getFloatValue(s).toString();
    var doubleat = /(\d*)(\.)(\d*)/;
    var point = getRegularValue(doubleat, s, doubleat, "$3");

    var endpart;
    if (s != point) {
        endpart = "." + point;
        s = s.replace(endpart, "");
    }

    var re = /\d{4}/;
    var at = /(\d*)(\d{3})/;

    s = getRegularValue(re, s, at, "$1,$2");

    if (endpart != null) {
        s = s + endpart;
    }
    return s;
}

function getRegularValue(re, s, at, valueat) {
    while (re.test(s)) {
        s = s.replace(at, valueat);
    }
    return s;
}

function onlydigital() {
    var iCode = event.keyCode;
    if (((iCode < 48) || ((iCode > 57) && (iCode < 96)) || iCode > 105) && ((iCode != 8) && (iCode != 109) && (iCode != 189) && (iCode != 9) && (iCode != 229) && (iCode != 13) && (iCode != 110) && (iCode != 190) && (iCode != 46) && (iCode != 27)) && ((iCode < 37) || (iCode > 40))) {
        event.returnValue = false;
    }
}

function addThousandSeparator(controlID) {
    var the_Val = controlID.val().replace(/,/g, "");
    if (!isNaN(parseFloat(the_Val))) {
        if (!/\./.test(the_Val)) {
            var theArray = [];
            var theFlag = "";
            var the_one = the_Val.slice(-1);
            var the_new = the_Val.replace(/\d$/, "");
            if (/-/.test(the_Val)) { theFlag = the_new.slice(0, 1); the_new = the_new.slice(1); }
            if (parseInt(the_new) >= 100) {
                departNum(the_new, theArray);
                controlID.val(theFlag + theArray.join(",") + the_one + ".00");
            }
            else {
                controlID.val(the_Val + ".00");
            }
        }
        else {
            var theArray = [];
            var theFlag = "";
            var the_now = parseFloat(the_Val).toFixed(2);
            var the_nowStr = String(the_now).slice(-4);
            var the_new = String(the_now).replace(/\d\.\d\d/, "");
            if (/-/.test(the_Val)) { theFlag = the_new.slice(0, 1); the_new = the_new.slice(1); }
            if (parseInt(the_new) >= 100) {
                departNum(the_new, theArray);
                controlID.val(theFlag + theArray.join(",") + the_nowStr);
            }
            else {
                controlID.val(String(the_now));
            }
        }
    }
}

//千分位处理函数(金额文本框调用) 
function departNum(textVal, the_other) {
    var the_array = [];
    var i = 0;
    the_array.push(textVal.slice(textVal.length - 2, textVal.length));
    for (i = textVal.length - 5; i >= 0; i -= 3) {
        the_array.push(textVal.slice(i, i + 3));
    }
    if (0 - i < 3) { the_array.push(textVal.slice(0, 3 + i)); }
    for (var k = the_array.length - 1; k >= 0; k--) {
        the_other.push(the_array[k]);
    }
}

