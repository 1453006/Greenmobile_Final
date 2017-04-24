/**
 * Created by Zac on 2/24/17.
 */


function InitPieChart(name1,name2,name3,y1,y2,y3,yother) {
    var chart = new CanvasJS.Chart("chartContainer",
        {
            title:{
                text: "Top sản phẩm",
                fontFamily: "arial black"

            },
            animationEnabled: false,
            legend: {
                verticalAlign: "bottom",
                horizontalAlign: "center"
            },
            theme: "theme2",
            data: [
                {
                    type: "pie",
                    indexLabelFontFamily: "Garamond",
                    indexLabelFontSize: 20,
                    indexLabelFontWeight: "bold",
                    startAngle:0,
                    indexLabelFontColor: "MistyRose",
                    indexLabelLineColor: "darkgrey",
                    indexLabelPlacement: "inside",
                    toolTipContent: "{name}: {y}hrs",
                    showInLegend: true,
                    indexLabel: "#percent%",
                    dataPoints: [
                        {  y: y1, name: name1, legendMarkerType: "triangle"},
                        {  y: y2, name: name2, legendMarkerType: "square"},
                        {  y: y3, name: name3, legendMarkerType: "circle"},
                        {  y: yother, name: "others", legendMarkerType: "cross"}
                    ]
                }
            ]
        });
   return chart;
}

function InitLineChart(data) {
    var mydata  = [];
    data.forEach(function (a) {
        mydata.push({x:new Date("1 "+ a.thang +" " +a.nam),y:a.doanhthu});
    });
    var ordersSplineChart = new CanvasJS.Chart("orders-spline-chart", {
        animationEnabled: false,
        backgroundColor: "transparent",
        theme: "theme2",
        toolTip: {
            borderThickness: 0,
            cornerRadius: 0
        },
        axisX: {
            labelFontSize: 14,
            maximum: new Date("31 Dec 2017"),
            valueFormatString: "MMM YYYY"
        },
        axisY: {
            gridThickness: 0,
            labelFontSize: 14,
            lineThickness: 2
        },
        data: [
            {
                type: "spline",
                dataPoints: mydata
            }
        ]
    });
    return ordersSplineChart;
}

function InitBarChart(label,data) {
    var mydata = [];
    for(var i =0 ;i< label.length;i++)
    {
        mydata.push({label:label[i],y:data[i]});
    }
    var barchart = new CanvasJS.Chart("barchart", {


        theme: "theme2",//theme1
        title:{
            text: ""
        },
        animationEnabled: false,   // change to true
        data: [
            {
                // Change type to "bar", "area", "spline", "pie",etc.
                type: "column",
                dataPoints: mydata
            }
        ]
    });

    return barchart;

}