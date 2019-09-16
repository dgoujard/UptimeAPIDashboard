<template>
    <div class="charts">
        <canvas v-if="data != ''" id="bubbleChart"></canvas>
    </div>
</template>

<script>
import moment,{ duration } from 'moment'
import Chart from 'chart.js'

export default {
    props: ['data','label'],
    name : 'BubbleCharts',
    data(){
        return{
            chart:''
        }
    },
    computed: {
        chartData: {
            get : function(){
                return this.data
            }
        }
    },
    mounted () {
        this.renderChart()
    },
    watch: {
        'data': function() {
            this.chart.destroy();
            this.renderChart();
        }
    },
    methods : {
        renderChart: function(){
            let vm = this;
            let datacharts = {
                datasets: this.chartData
            };
            let options = {
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            let site = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].site;
                            let day = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].day;
                            let label = tooltipItem;
                            let seconds = label.yLabel*60;
                            return site+" - "+vm.convertSecondIntoTime(seconds)+" - "+day;
                        
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            min: 0,
                            max: 24,
                            stepSize: 1,
                            labelString: 'Heures',
                            callback: function(value, index, values) {
                                return value+'h';
                            }
                        }
                    }],
                    yAxes: [{
                        type: 'linear',
                        ticks: {
                            min:0,
                            max:15,
                            suggestedMax: 15,
                            callback: function(value, index, values) {
                                return value+'m';
                            },
                        }
                    }]
                }  
            };
            vm.chart = new Chart($('#bubbleChart')[0].getContext('2d'), {
                type: 'bubble',
                data: datacharts,
                options:options
            });
        },
        convertSecondIntoTime: function(second){
            let time = 0;
            let days = moment.duration(second, 'seconds').days();
            let hours = moment.duration(second, 'seconds').hours();
            let minutes = moment.duration(second, 'seconds').minutes();
            let seconds = moment.duration(second, 'seconds').seconds();
            
            if(days == "0" && hours == "0" && minutes == "0" )
                time = seconds+" s";
            else if(days == "0" && hours == "0")
                time = minutes+"m"+seconds+"s";
            else if(days == "0")
                time = hours+"h"+minutes+"m"+seconds+"s";
            else
                time = days+"j"+hours+"h"+minutes+"m"+seconds+"s";

            return time;
        }
    }
}
</script>