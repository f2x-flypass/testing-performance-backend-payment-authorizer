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

    var data = {"OkPercent": 37.70983213429257, "KoPercent": 62.29016786570743};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.21732613908872903, 400, 900, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4738095238095238, 400, 900, "autorizacionSalida"], "isController": false}, {"data": [0.3689655172413793, 400, 900, "autorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "preAutorizacionPlacasNoFlypass"], "isController": false}, {"data": [0.5, 400, 900, "autorizacion"], "isController": false}, {"data": [0.4722222222222222, 400, 900, "preAutorizacion"], "isController": false}, {"data": [0.4793103448275862, 400, 900, "preAutorizacionConSubAccountId"], "isController": false}, {"data": [0.0, 400, 900, "loginCognito"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1668, 1039, 62.29016786570743, 644.2931654676262, 116, 11050, 723.0, 826.0, 883.0, 1611.7899999999995, 2.3606835792378726, 1.081011116565828, 4.379222337950678], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["autorizacionSalida", 210, 0, 0.0, 656.4857142857144, 450, 9910, 537.5, 707.8, 931.0999999999993, 7694.8199999999015, 0.2981904101964081, 0.15753589067700582, 0.5901740668770092], "isController": false}, {"data": ["autorizacionConSubAccountId", 145, 89, 61.37931034482759, 184.77931034482745, 116, 1618, 148.0, 256.4000000000001, 315.09999999999997, 1322.6799999999948, 0.2093935385486284, 0.09507606130031944, 0.4249978067831954], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 879, 879, 100.0, 795.4880546075092, 691, 6507, 760.0, 852.0, 895.0, 1474.800000000007, 1.2548018655006572, 0.514664827646754, 2.2461443549440476], "isController": false}, {"data": ["autorizacion", 144, 71, 49.30555555555556, 165.8402777777778, 116, 877, 146.0, 197.5, 282.5, 765.4000000000028, 0.2092047169852438, 0.09808315497057332, 0.4281591546676623], "isController": false}, {"data": ["preAutorizacion", 144, 0, 0.0, 659.7222222222224, 455, 8267, 545.0, 710.5, 931.5, 6450.800000000046, 0.20674001151427007, 0.11073214633101085, 0.37088027456222084], "isController": false}, {"data": ["preAutorizacionConSubAccountId", 145, 0, 0.0, 622.5241379310345, 403, 11050, 477.0, 632.0, 811.7999999999986, 7421.979999999937, 0.20829412854764406, 0.11176871028944266, 0.36973189807306384], "isController": false}, {"data": ["loginCognito", 1, 0, 0.0, 1645.0, 1645, 1645, 1645.0, 1645.0, 1645.0, 1645.0, 0.6079027355623101, 2.4678238981762917, 0.2760495820668693], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 160, 15.399422521655438, 9.59232613908873], "isController": false}, {"data": ["404/Not Found", 879, 84.60057747834456, 52.697841726618705], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1668, 1039, "404/Not Found", 879, "400/Bad Request", 160, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["autorizacionConSubAccountId", 145, 89, "400/Bad Request", 89, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["preAutorizacionPlacasNoFlypass", 879, 879, "404/Not Found", 879, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["autorizacion", 144, 71, "400/Bad Request", 71, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
