<template>
    <div class="piecharts">
        <canvas v-if="data != ''" id="pieChart"></canvas>
    </div>
</template>

<script>
import Chart from 'chart.js'

export default {
    props: ['data','label', 'colors'],
    name : 'PieChart',
    data(){
        return{
            chart: ""
        }
    },
    computed: {
        chartData: {
            get : function(){
                return this.data
            }
        },
        chartColors: {
            get : function(){
                return this.colors
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
                        label: 'Pannes',
                        backgroundColor: this.chartColors,
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

            vm.chart = new Chart($('#pieChart')[0].getContext('2d'), {
                type: 'pie',
                data: datacharts,
                options: options
            });
        }
    }
}
</script>