<template>
    <div class="charts">
        <canvas v-if="data != ''" id="myChart"></canvas>
    </div>
</template>

<script>
import Chart from 'chart.js'

export default {
    props: ['data','months'],
    name : 'Charts',
    data(){
        return{
            chartdata: {
                labels: this.months,
                datasets: [
                    {
                        label: 'Moyenne',
                        backgroundColor: '#0fd5c0',
                        data: this.data
                    }
                ]
            }, 
            options: {
                elements: {
                    line: {
                        fill: false
                    }
                }
            }
        }
    },
    mounted () {
        this.renderChart(this.chartdata)
    },
    methods : {
        renderChart: function(){
            let vm = this;
            var myChart = new Chart($('#myChart')[0].getContext('2d'), {
                type: 'line',
                data: vm.chartdata,
                options: vm.options
            });
        }
    }
}
</script>