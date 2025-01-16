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

    var data = {"OkPercent": 43.11355311355312, "KoPercent": 56.88644688644688};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2802197802197802, 400, 900, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.49693251533742333, 400, 900, "autorizacionSalida"], "isController": false}, {"data": [0.7291666666666666, 400, 900, "autorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "preAutorizacionPlacasNoFlypass"], "isController": false}, {"data": [0.7725409836065574, 400, 900, "autorizacion"], "isController": false}, {"data": [0.4897959183673469, 400, 900, "preAutorizacion"], "isController": false}, {"data": [0.4979166666666667, 400, 900, "preAutorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "loginCognito"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2730, 1553, 56.88644688644688, 570.7326007326009, 104, 2605, 704.0, 793.0, 829.0, 1030.800000000001, 2.3683916018395377, 1.0958564004807054, 4.3937420741840105], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["autorizacionSalida", 326, 0, 0.0, 500.89263803680956, 427, 2595, 472.5, 575.0, 641.5999999999999, 855.7200000000012, 0.3076266884081357, 0.16251805596446628, 0.6088515524885677], "isController": false}, {"data": ["autorizacionConSubAccountId", 240, 63, 26.25, 141.7416666666667, 105, 645, 127.0, 160.8, 194.39999999999986, 638.3100000000001, 0.2151999297013563, 0.10669629327087754, 0.4367780995066542], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 1434, 1434, 100.0, 758.3647140864716, 681, 2605, 736.0, 822.0, 867.25, 1227.3500000000017, 1.3161759306850724, 0.5398377840700492, 2.3560063290485718], "isController": false}, {"data": ["autorizacion", 244, 54, 22.131147540983605, 140.91803278688522, 104, 652, 126.0, 173.5, 202.0, 633.3500000000001, 0.21370178791323707, 0.10715452538715932, 0.4373481466515382], "isController": false}, {"data": ["preAutorizacion", 245, 2, 0.8163265306122449, 505.19183673469416, 428, 2155, 478.0, 573.4000000000001, 645.2999999999997, 945.1199999999998, 0.2130201386630682, 0.1129614684608469, 0.3821464792227113], "isController": false}, {"data": ["preAutorizacionConSubAccountId", 240, 0, 0.0, 472.72083333333273, 396, 1969, 445.0, 529.2, 607.6999999999997, 1029.2800000000002, 0.21449388826477125, 0.1139193309153616, 0.38073799778222256], "isController": false}, {"data": ["loginCognito", 1, 0, 0.0, 1687.0, 1687, 1687, 1687.0, 1687.0, 1687.0, 1687.0, 0.5927682276229994, 2.4063842990515707, 0.2691769783639597], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 117, 7.533805537669028, 4.285714285714286], "isController": false}, {"data": ["404/Not Found", 1436, 92.46619446233098, 52.6007326007326], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2730, 1553, "404/Not Found", 1436, "400/Bad Request", 117, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["autorizacionConSubAccountId", 240, 63, "400/Bad Request", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 1434, 1434, "404/Not Found", 1434, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacion", 244, 54, "400/Bad Request", 54, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacion", 245, 2, "404/Not Found", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
