<template>
    <div id="dashboard">
        <Header :options="optionsHeader" :keyRoute="key" :date="date" :idAccount="idAccount" :accounts="accounts"></Header>
        <div class="container" v-if="average != ''">
            <div class="row">
                <div class="col-lg-4 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Moyenne sur l'année</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            {{averageYear}}
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Nombre de panne totale</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <span>{{incidents}}</span>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Temps cumulé des pannes</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <span>{{cumulLogDown}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row my-3">
                <div class="col-lg-6 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Moyennes sur l'année</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <LineCharts v-if="average != ''" :data="average" :label="months"></LineCharts>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Répartition des pannes</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <PieCharts v-if="average != ''" :data="downs" :label="allDownTypes" :colors="pieColors"></PieCharts>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row my-3">
                <div class="col-lg-12 my-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Heures et durée des pannes par type</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <BubbleCharts v-if="average != ''" :data="downsDetailed" :label="months"></BubbleCharts>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment,{ duration } from 'moment'
import axios from 'axios'
import Header from '@/components/Header';
import LineCharts from '@/components/LineCharts';
import PieCharts from '@/components/PieCharts';
import BubbleCharts from '@/components/BubbleCharts';
import mixin from '@/mixins/mixins.js';

export default {
    name : 'Result',
    mixins:[mixin],
    components: {
      Header, LineCharts, PieCharts, BubbleCharts
    },
    data(){
        return{
            optionsHeader: {"hasSearch":false, "hasCsv":false, "hasCount":false, "hasDashboard":false, "hasAccount": true, "hasDate": true},
            key:this.$route.params.key,
            date:this.$route.params.year,
            accounts: process.env.Accounts,
            idAccount: this.$route.params.id,
            accounts: process.env.Accounts, 
            processing:false,
            results: [],
            incidents: 0,
            downs: [],
            downsDetailed: [],
            pieColors: [],
            allDownTypes: [],
            averageYear: 0,
            cumulLogDown: 0
        }
    },
    created(){
        this.getData();
    },
    watch: {
        '$route': 'getData'
    },
    methods : {
        getData: async function(){
            let vm = this;  
            vm.getRange();
            vm.getMonth();
            vm.filter = await vm.getUptimeData();
        },
        getRandomColors: function(downsType){
            let vm = this;
            let randomColors = []
            Object.keys(downsType).forEach(function(key) {
                var randomR = Math.floor((Math.random() * 40));
                var randomG = Math.floor((Math.random() * 130) + 100);
                var randomB = Math.floor((Math.random() * 130) + 100);
                var graphBackground = "rgb(" 
                    + randomR + ", " 
                    + randomG + ", " 
                    + randomB + ")";

                vm.pieColors.push(graphBackground);
                randomColors[key] = graphBackground;
            });
            return randomColors;
        },
        getUptimeData: async function(){
            let vm = this;
            vm.processing = true;
            let currentDate;
            var results = [];
            let cumulLogDownTmp = 0;
            let year = moment().format('YYYY');
            if("year" in this.$route.params && parseInt(year) != this.$route.params.year)
                currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X');
            else
                currentDate = moment().format('X');

            let startYear = moment(currentDate, 'X').startOf('year').format('X');
            
            if(this.$route.params.id !== undefined){
                vm.idAccount = this.$route.params.id;
            } else {
                vm.idAccount = '0';
            }

            let route = vm.accounts[vm.idAccount]["key"];
            if(this.$route.params.interval !== undefined) {
                this.custom_interval = this.$route.params.interval;
                this.$route.params.interval = undefined;
            } 

            if(vm.custom_interval[0] === "0" && vm.custom_interval[1] === "0")
              vm.custom_interval[1] = "86399";  

            $.each(route, async function(key, value) {
                let data = {
                    "account":value,
                    "ranges":vm.range,
                    "custom_interval":vm.custom_interval
                };
                if(vm.custom_interval[0] === "0" && vm.custom_interval[1] === "86400"){
                    data = {
                        "account":value,
                        "ranges":vm.range
                    };
                }

                let url = process.env.urlAPI+'siteslogs';
                let downsTmp = {}
                await axios.post(url, data).
                then(function (response) {
                    vm.incidents = 0;
                    vm.downs = [];
                    vm.cumulLogDownTmp = 0;
                    vm.allDownTypes = [];
                    vm.downsDetailed = [];
                    var monitors = response.data;
                    for(var i in monitors){
                        var logs = monitors[i].logs;
                        const reducer = (accumulator, currentValue) => accumulator + currentValue;
                        var logsDuration = Array();
                        for(var j in logs) {
                            if(typeof downsTmp[logs[j].reason.code] === "undefined"){
                                downsTmp[logs[j].reason.code] = {count:0, logs:[]};
                            }
                            logs[j]["sitename"] = monitors[i].friendly_name;
                            cumulLogDownTmp = cumulLogDownTmp + logs[j].duration;
                            downsTmp[logs[j].reason.code].count = downsTmp[logs[j].reason.code].count+1;
                            downsTmp[logs[j].reason.code].logs.push(logs[j]);

                            vm.incidents++;
                            if(logs[j].type == 1)
                                logsDuration.push(logs[j].duration);
                        }
                        if(logsDuration.length > 0){
                            var cumul = vm.convertSecondIntoTime(logsDuration.reduce(reducer));
                            var secondeCumul = logsDuration.reduce(reducer);
                        }else{ 
                            var cumul = 0;
                            var secondeCumul = 0;
                        }

                        let range = monitors[i].custom_uptime_ranges;
                        let ranges = range.split('-').reverse();
                        let longerLogDown = vm.searchForLongerLog(monitors[i].logs, 1);
                        var total = 0;
                        var numberRange = 0
                        
                        for(var k in ranges){
                            if(ranges[k] !== "0.000"){
                                numberRange = numberRange + 1;
                                total = total + parseFloat(ranges[k]);
                            }
                        }
                        
                        if(total === 0)
                            ranges.unshift("0.000");
                        else 
                            ranges.unshift((total/numberRange).toFixed(3));
                        
                        let tmpAccountName = monitors[i].accountname.split('@');
                        results.push({
                            "status":monitors[i].status,
                            "id":monitors[i].id,
                            "name":monitors[i].friendly_name+" - "+tmpAccountName[0],
                            "ranges": ranges.map(Number),
                            "cumul":cumul,
                            "cumulSeconde":secondeCumul,
                            "longerLogDown":longerLogDown,
                            "timestampLogdown": longerLogDown[0]["timestamp"],
                            "url":monitors[i].url,
                            "isVisible":true,
                            "ssl":monitors[i].ssl
                        });
                        vm.processing = false;
                    }   

                    vm.cumulLogDown = vm.convertSecondIntoTime(cumulLogDownTmp);
                    let colors = vm.getRandomColors(downsTmp)
                    Object.keys(downsTmp).forEach(function(key) {
                        vm.allDownTypes.push(key);
                        let data = [];
                        downsTmp[key].logs.forEach(element => {
                            let datetime = moment(element.datetime, "X").format('HH:mm:ss');
                            let day = moment(element.datetime, "X").locale('fr').format('Do MMMM YYYY, HH:mm:ss')
                            data.push(
                                {
                                    site: element.sitename,
                                    day : day,
                                    x: moment.duration(datetime).asHours().toFixed(3),
                                    y: element.duration/60,
                                    r: 5
                                }
                            ) 
                        });
                        vm.downsDetailed.push({
                            label: key,
                            data: data,
                            backgroundColor:colors[key],
                            hoverBackgroundColor: colors[key]
                        })
                        vm.downs.push(downsTmp[key].count)
                    });

                    vm.getMoyenne("dashboard");
                })
            });
            return results;
        }
    }
}

</script>

<style>

</style>