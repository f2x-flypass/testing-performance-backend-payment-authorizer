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

    var data = {"OkPercent": 32.47457627118644, "KoPercent": 67.52542372881356};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32169491525423727, 900, 400, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3837837837837838, 900, 400, "autorizacionSalida"], "isController": false}, {"data": [0.83399209486166, 900, 400, "autorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 900, 400, "preAutorizacionPlacasNoFlypass"], "isController": false}, {"data": [0.396, 900, 400, "autorizacion"], "isController": false}, {"data": [0.9800796812749004, 900, 400, "preAutorizacion"], "isController": false}, {"data": [0.9920948616600791, 900, 400, "preAutorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 900, 400, "loginCognito"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2950, 1992, 67.52542372881356, 586.5735593220338, 100, 21749, 690.0, 777.0, 814.0, 916.9199999999983, 2.4523373684674303, 1.1041192760263656, 4.548158723275757], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["autorizacionSalida", 370, 227, 61.351351351351354, 486.46486486486486, 407, 2265, 477.5, 540.9000000000001, 575.3499999999999, 698.6400000000024, 0.3081848909441952, 0.140107482343921, 0.6099576685667237], "isController": false}, {"data": ["autorizacionConSubAccountId", 253, 42, 16.600790513833992, 131.4545454545455, 101, 650, 125.0, 146.6, 162.7999999999999, 393.0600000000029, 0.21216181992912286, 0.10758528428216348, 0.43056634286482187], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 1572, 1572, 100.0, 762.2620865139951, 668, 21749, 738.5, 810.0, 827.0, 989.9399999999978, 1.3095754792821328, 0.5371305676743123, 2.344227058895075], "isController": false}, {"data": ["autorizacion", 250, 151, 60.4, 133.11999999999998, 100, 472, 130.0, 150.9, 166.34999999999997, 187.0, 0.20984738219587656, 0.09564122330111756, 0.42946496340891194], "isController": false}, {"data": ["preAutorizacion", 251, 0, 0.0, 589.3067729083668, 415, 21549, 469.0, 554.8, 591.4, 3003.59999999998, 0.20921984337685828, 0.11251313484885743, 0.3753289573078991], "isController": false}, {"data": ["preAutorizacionConSubAccountId", 253, 0, 0.0, 537.5810276679841, 384, 21491, 445.0, 503.0, 546.3999999999999, 1391.02000000001, 0.21151900744914764, 0.11197186217195744, 0.37540884487003706], "isController": false}, {"data": ["loginCognito", 1, 0, 0.0, 1662.0, 1662, 1662, 1662.0, 1662.0, 1662.0, 1662.0, 0.601684717208183, 2.442581415463297, 0.2732259702166065], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 420, 21.08433734939759, 14.23728813559322], "isController": false}, {"data": ["404/Not Found", 1572, 78.91566265060241, 53.28813559322034], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2950, 1992, "404/Not Found", 1572, "400/Bad Request", 420, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["autorizacionSalida", 370, 227, "400/Bad Request", 227, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacionConSubAccountId", 253, 42, "400/Bad Request", 42, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 1572, 1572, "404/Not Found", 1572, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacion", 250, 151, "400/Bad Request", 151, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
