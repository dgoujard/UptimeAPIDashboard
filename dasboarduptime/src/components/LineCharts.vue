<template>
    <div class="charts">
        <canvas v-if="data != ''" id="myChart"></canvas>
    </div>
</template>

<script>
import Chart from 'chart.js'

export default {
    props: ['data','label'],
    name : 'LineCharts',
    data(){
        return{
            chart:''
        }
    },
    computed: {
        chartData: {
            get : function(){
                return this.data;
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
                labels: this.label,
                datasets: [
                    {
                        label: 'Moyenne',
                        backgroundColor: '#0fd5c0',
                        data: this.chartData
                    }
                ]
            };
            let options = {
                elements: {
                    line: {
                        fill: false
                    }
                }
            };

            vm.chart = new Chart($('#myChart')[0].getContext('2d'), {
                type: 'line',
                data: datacharts,
                options: options
            });
        }
    }
}
</script>