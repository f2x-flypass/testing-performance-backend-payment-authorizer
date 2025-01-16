/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 27.832326283987914, "KoPercent": 72.16767371601209};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2094977341389728, 400, 900, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.20404984423676012, 400, 900, "autorizacionSalida"], "isController": false}, {"data": [0.9716157205240175, 400, 900, "autorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "preAutorizacionPlacasNoFlypass"], "isController": false}, {"data": [0.2876712328767123, 400, 900, "autorizacion"], "isController": false}, {"data": [0.225, 400, 900, "preAutorizacion"], "isController": false}, {"data": [0.6691973969631236, 400, 900, "preAutorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "loginCognito"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5296, 3822, 72.16767371601209, 551.4384441087608, 85, 4295, 676.0, 747.0, 780.0, 852.0, 4.816388817902124, 2.142338930115526, 8.924254511556242], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["autorizacionSalida", 642, 389, 60.59190031152648, 452.64797507788165, 378, 2164, 446.0, 485.0, 508.8000000000002, 757.370000000002, 0.585128441161325, 0.2665452799525153, 1.158080947324769], "isController": false}, {"data": ["autorizacionConSubAccountId", 458, 12, 2.6200873362445414, 117.27074235807859, 95, 444, 114.0, 131.0, 139.0, 202.709999999999, 0.42057743996899843, 0.22029755767787992, 0.8535832001236938], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 2854, 2854, 100.0, 715.612824106517, 652, 4295, 714.0, 751.0, 774.0, 852.8999999999996, 2.602456923593178, 1.0674139725675145, 4.658599286717987], "isController": false}, {"data": ["autorizacion", 438, 312, 71.23287671232876, 110.42694063926939, 85, 313, 107.5, 126.0, 133.04999999999995, 172.0, 0.40160053400034473, 0.17799426492890388, 0.820541509151541], "isController": false}, {"data": ["preAutorizacion", 440, 255, 57.95454545454545, 644.9113636363634, 350, 2474, 739.0, 807.0, 825.0, 1256.8499999999997, 0.40204604889245454, 0.18579371000098682, 0.7212486248197646], "isController": false}, {"data": ["preAutorizacionConSubAccountId", 461, 0, 0.0, 426.46203904555296, 363, 2011, 419.0, 454.8, 488.79999999999995, 755.7599999999991, 0.42058359851691823, 0.2217823316228688, 0.7465193157693304], "isController": false}, {"data": ["loginCognito", 3, 0, 0.0, 1674.0, 1571, 1835, 1616.0, 1835.0, 1835.0, 1835.0, 0.030663559425978166, 0.12448087552128051, 0.01392437024714829], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 962, 25.170068027210885, 18.164652567975832], "isController": false}, {"data": ["404/Not Found", 2860, 74.82993197278911, 54.003021148036254], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5296, 3822, "404/Not Found", 2860, "400/Bad Request", 962, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["autorizacionSalida", 642, 389, "400/Bad Request", 389, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacionConSubAccountId", 458, 12, "400/Bad Request", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 2854, 2854, "404/Not Found", 2854, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacion", 438, 312, "400/Bad Request", 312, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacion", 440, 255, "400/Bad Request", 249, "404/Not Found", 6, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
