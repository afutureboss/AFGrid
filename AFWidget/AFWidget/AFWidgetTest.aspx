<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AFWidgetTest.aspx.cs" Inherits="AFWidget.AFWidgetTest" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <style type="text/css">
        .theme
        {
            background-color: #117788;
            color: #ffffff;
            cursor: pointer;
            text-align: center;
        }
    </style>
    <script src="Script/jquery/jquery-1.10.2.js" type="text/javascript"></script>
    <script src="Script/jquery/jquery-ui-1.10.4.custom.min.js" type="text/javascript"></script>
    <script src="Script/My97DatePicker/WdatePicker.js" type="text/javascript"></script>
    <script src="Script/jquery-AFWidget.js" type="text/javascript"></script>
    <script type="text/javascript">
        $(function () {
            var test = $("#test_tb").AFGrid({
                IsReadOnly: false,
                TotalRow: "<tr><td width='10%'></td><td width='22.5%'></td><td width='22.5%' align='right'>合计金额</td><td  align='left'><label id='lbl_RecordsTotal'></label></td><td width='22.5%'></td></tr>",
                InsertRow: "<tr><td width='10%'><a href='#' >插入项</a></td><td width='22.5%'><input type='text' style='width: 100%' /></td><td width='22.5%'><input type='text' class='Wdate' onclick='WdatePicker()' style='width: 100%' /></td><td  width='22.5%'><input type='text' style='width: 100%' onkeydown='onlydigital()' class='thousandSeparator'/></td><td width='22.5%'><select style='width: 100%'><option value='1'>正常</option><option value='2'>退票</option></select></td></tr>",
                DataSource: $("#<%=hf_test.ClientID %>").val(),
                HeadRow: "<tr><th width='10%'></th><th width='22.5%'>发票编号</th><th width='22.5%'>开具时间</th><th width='22.5%'>发票金额</th><th width='22.5%'>状态</th><tr>",
                Title: "执行记录",
                Change: function (event, data) {
                    if (ValidateTb(event, data)) {
                        CalculateTb(event, data);
                    }
                },
                Validate: function (event, data) {
                    ValidateTb(event, data);
                },
                InsertRowCalculate: function (event, data) {

                },
                TableCalculate: function (event, data) {
                    CalculateTb(event, data);
                }
            });
            $("#btn_test").click(function () {
                test.AFGrid("option", {
                    DataSource: "a#2014-04-16#1000#1;b#2014-04-15#1000#2;c#2014-04-26#2000#1;",
                    IsAdd: false,
                    IsReadOnly: false
                });
            });
            $("#btn_test1").click(function () {
                test.AFGrid("option", {
                    DataSource: "a#2014-04-16#1000#1;b#2014-04-15#1000#2;",
                    IsAdd: false,
                    IsReadOnly: true
                });
            });
        });

        function CalculateTb(event, data) {
            var totalAmount = 0.00;
            var detailData = "";
            data.contentBody.find("tr").each(function (index, ele) {
                var lineData = "";
                var recordNo = $(ele).find("input[type='text']:eq(0)").val() + "#";
                var recordDate = $(ele).find("input[type='text']:eq(1)").val() + "#";
                var recordAmountTemp = $(ele).find("input[type='text']:eq(2)").val().replace(/,/g, "");
                var recordAmount = recordAmountTemp + "#";
                var floatTempVar = parseFloat(recordAmountTemp);
                totalAmount += floatTempVar;
                var status = $(ele).find("select:first-child").val() + "#;";
                lineData = recordNo + recordDate + recordAmount + status;
                detailData += lineData;
            });
            totalAmount = getValueWithThousandSeparator(totalAmount);
            data.calculateRow.find("#lbl_RecordsTotal").text(totalAmount);
            detailData = detailData.substr(0, detailData.length - 1);
            $("#<%=hf_test.ClientID %>").val(detailData);
        }

        function ValidateTb(event, data) {
            var validResult = true;
            data.currentRow.find("input[type='text']").each(function (index, ele) {
                if ($(ele).val() === "") {
                    $(ele).css("borderColor", "Red");
                    validResult = false;
                }
                else {
                    $(ele).css("borderColor", "");
                }
            });
            data.currentRow.find("select").each(function (index, ele) {
                if ($(ele).val() === "0") {
                    $(ele).css("borderColor", "Red");
                    validResult = false;
                } else {
                    $(ele).css("borderColor", "");
                }
            });
            if (!validResult) {
                event.preventDefault();
            }
            return validResult;
        }
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <table id="test_tb" width="100%">
        </table>
        <input type="button" id="btn_test" value="change" />
        <input type="button" id="btn_test1" value="changeAgain" />
    </div>
    <asp:HiddenField ID="hf_test" runat="server" />
    <asp:HiddenField ID="hf_test1" runat="server" />
    </form>
</body>
</html>
