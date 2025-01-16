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

    var data = {"OkPercent": 46.91821414460687, "KoPercent": 53.08178585539313};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.31706835242986964, 400, 900, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.49201277955271566, 400, 900, "autorizacionSalida"], "isController": false}, {"data": [0.9885321100917431, 400, 900, "autorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "preAutorizacionPlacasNoFlypass"], "isController": false}, {"data": [0.9865168539325843, 400, 900, "autorizacion"], "isController": false}, {"data": [0.4730337078651685, 400, 900, "preAutorizacion"], "isController": false}, {"data": [0.4942922374429224, 400, 900, "preAutorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "loginCognito"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5062, 2687, 53.08178585539313, 604.835440537337, 100, 21927, 717.0, 805.0, 850.0, 1026.1099999999997, 4.670836155335291, 2.1799172153807254, 8.665124434426977], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["autorizacionSalida", 626, 0, 0.0, 552.816293929712, 441, 2025, 516.0, 654.5000000000003, 752.7999999999997, 1157.3300000000022, 0.5790436160441331, 0.30590695452426386, 1.1460379752828849], "isController": false}, {"data": ["autorizacionConSubAccountId", 436, 5, 1.146788990825688, 136.3119266055045, 105, 359, 128.5, 162.60000000000002, 186.7499999999999, 304.2299999999999, 0.4072703359606629, 0.21407909644133535, 0.8266101642322301], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 2670, 2670, 100.0, 783.3580524344583, 692, 21927, 746.0, 830.9000000000001, 881.0, 1022.5799999999999, 2.47477261288717, 1.0150434545045033, 4.430041025496647], "isController": false}, {"data": ["autorizacion", 445, 6, 1.348314606741573, 140.69887640449437, 100, 384, 130.0, 173.40000000000003, 209.7, 319.7000000000001, 0.4143192455479302, 0.21806768981407773, 0.8479087730703664], "isController": false}, {"data": ["preAutorizacion", 445, 6, 1.348314606741573, 626.5123595505619, 435, 21524, 515.0, 731.6000000000001, 862.8, 2037.7000000000103, 0.4128696575130216, 0.21731016780832088, 0.7406655867689657], "isController": false}, {"data": ["preAutorizacionConSubAccountId", 438, 0, 0.0, 502.02054794520495, 410, 2057, 470.5, 596.1, 654.1499999999999, 1214.6900000000032, 0.4059773208833622, 0.21402624126638972, 0.7206325547235184], "isController": false}, {"data": ["loginCognito", 2, 0, 0.0, 1661.0, 1493, 1829, 1661.0, 1829.0, 1829.0, 1829.0, 0.02468648168263059, 0.1002165081588822, 0.01121016990471018], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 11, 0.40937848902121327, 0.21730541288028446], "isController": false}, {"data": ["404/Not Found", 2676, 99.59062151097879, 52.86448044251284], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5062, 2687, "404/Not Found", 2676, "400/Bad Request", 11, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["autorizacionConSubAccountId", 436, 5, "400/Bad Request", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 2670, 2670, "404/Not Found", 2670, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacion", 445, 6, "400/Bad Request", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacion", 445, 6, "404/Not Found", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
