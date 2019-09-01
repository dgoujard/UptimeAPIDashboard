<template>
    <div id="dashboard">
        <Header :hasSearch="hasSearch" :keyRoute="key" :date="date"></Header>
        <div class="container" v-if="average != ''">
            <div class="row">
                <div class="col-lg-3">
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
                <div class="col-lg-3">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Nombre de panne totale</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <span>{{incident}}</span>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card border-primary">
                        <div class="card-header">
                            <div class="col-xs-9 text-center">
                                <strong>Moyennes sur l'année</strong>
                            </div>
                        </div>
                        <div class="card-body text-center">
                            <Charts v-if="average != ''" :data="average" :months="months"></Charts>
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
import Charts from '@/components/Charts';

export default {
    name : 'Result',
    components: {
      Header, Charts
    },
    data(){
        return{
            hasSearch:false,
            key:this.$route.params.key,
            search:'',
            date:this.$route.params.year,
            accounts: process.env.Accounts,
            idAccount: this.$route.params.id,
            processing:false,
            idAccount: '',
            daysSelected:[],
            custom_interval:["0", "86400"],
            currentDate: moment().format('X'),
            currentStartDate: null,
            startDate: null,
            endDate: null,
            months:[],
            range: '',
            results: [],
            average: [],
            incident: 0,
            averageYear: 0
        }
    },
    created(){
        this.getData();
    },
    watch: {
        '$route': 'getData'
    },
    methods : {
        getRange: function(){
            let months = Array()
            let year = moment().format('YYYY')
            if("year" in this.$route.params && parseInt(year) != this.$route.params.year){
                this.date = this.$route.params.year;
                this.currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X');
            } else {
                this.currentDate = moment().format('X');
                this.date = moment(this.currentDate, 'X').startOf('year').format('YYYY');
            }

            let startMonth = moment(this.currentDate, 'X').startOf('month').format('X');
            let startYear = moment(this.currentDate, 'X').startOf('year').format('X');
            if(this.currentStartDate !== null)
                startYear = this.currentStartDate;

            this.startDate = startYear;
            let rang = ""+startMonth+"_"+this.currentDate+"";
            months.push(rang);

            let dateInTheMonth = startMonth-1;
            let startBefore = startMonth;
            while(dateInTheMonth>startYear){
                let startMonth = moment(dateInTheMonth, 'X').startOf('month').format('X');
                let endMonth = startBefore;
                startBefore = startMonth;
                rang = ""+startMonth+"_"+endMonth+"";
                months.push(rang);
                dateInTheMonth = startMonth-1;
            }
            let monthRange = months.join('-');
            let range = monthRange;
            this.range = range;
        },
        getMoyenne: function(){
            let vm = this;
            var results = vm.results;
            var ranges = [];
            vm.average = [];
            results.forEach(function(element) { 
                if(element["isVisible"])
                    ranges.push(element["ranges"]);
            })
            if(typeof ranges[0] !== "undefined") {
                var lengthArray = ranges[0].length;
                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                for(var i = 0; i<lengthArray; i++){
                    var arrayElement = [];
                    for(var j = 0; j<ranges.length; j++){
                        if(ranges[j][i] != 0)
                            arrayElement.push(ranges[j][i]);
                    }
                    if(arrayElement.length != 0){
                        vm.average.push((arrayElement.reduce(reducer)/arrayElement.length).toFixed(3));
                    }
                    else 
                        vm.average.push('nc');
                }
            } else {
                vm.average = [];
            }
            let totalAverage = 0;
            for(var k in vm.average){
                if(vm.average[k] !== "0.000"){
                    totalAverage = totalAverage + parseFloat(vm.average[k]);
                }
            }

            vm.averageYear = (totalAverage / this.average.length).toFixed(3)

        },
        getMonth: function(){
            let months = Array();

            let year = moment().format('YYYY');
            if("year" in this.$route.params && parseInt(year) != this.$route.params.year)
                this.currentDate = parseInt(moment(this.$route.params.year, 'YYYY').endOf('year').format('X'));

            let startMonth = parseInt(moment(this.currentDate, 'X').startOf('month').format('X'));
            
            let startYear = moment(this.currentDate, 'X').startOf('year').format('X');
            if(this.currentStartDate !== null)
                startYear = this.currentStartDate;

            months.push(moment(this.currentDate, 'X').locale('fr').format('MMM'));
            let dateInTheMonth = startMonth-1;
            while(dateInTheMonth>startYear){
                let name = moment(dateInTheMonth, 'X').locale('fr').format('MMM');
                startMonth = parseInt(moment(dateInTheMonth, 'X').startOf('month').format('X'));
                months.unshift(name);
                dateInTheMonth = startMonth-1;
            }

            this.months = months
        },
        getData: async function(){
            let vm = this;  
            vm.getRange();
            vm.getMonth();
            vm.results = await vm.getUptimeData();
        },
        getUptimeData: async function(){
            let vm = this;
            vm.processing = true;
            let currentDate;
            var results = [];
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
            if(this.$route.params.daysSelected !== undefined) {
                this.daysSelected = this.$route.params.daysSelected;
                this.$route.params.daysSelected = undefined;
            }

            if(vm.custom_interval[0] === "0" && vm.custom_interval[1] === "0")
              vm.custom_interval[1] = "86399";  

            $.each(route, async function(key, value) {
                let data = {
                    "account":value,
                    "ranges":vm.range,
                    "custom_interval":vm.custom_interval,
                    "custom_days_range":vm.daysSelected
                };
                if(vm.custom_interval[0] === "0" && vm.custom_interval[1] === "86400"){
                    data = {
                        "account":value,
                        "ranges":vm.range
                    };
                }

                let url = process.env.urlAPI+'siteslogs';
                await axios.post(url, data).
                then(function (response) {
                    var monitors = response.data;
                    for(var i in monitors){
                        var logs = monitors[i].logs;
                        const reducer = (accumulator, currentValue) => accumulator + currentValue;
                        var logsDuration = Array();
                        for(var j in logs) {
                            vm.incident++
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
                    vm.getMoyenne();
   
                    if(vm.search != ""){
                        vm.searchInTab(vm.search);
                    } else { 
                        if(typeof vm.$route.params.search !== "undefined")
                            if(vm.$route.params.search != "")
                                vm.searchInTab(vm.$route.params.search);
                    }
                })
            });

            return results;
        },
        searchForLongerLog: function(log, mode){
            let date = 0;
            let duration = 0;
            let dateInSecond = 0;
            let logs = Array();
            let logsDown = Array();
            let maxLogDown = Array();
            let maxLogDownInSecond = Array();

            if(mode == 1){
              for(var i in log){
                if(log[i].type == 1)
                    logs.push(log[i]);
              }
            }else{
                logs = log;
            }
            for (var i in logs){
                if (logs[i].duration>duration){
                    dateInSecond = logs[i].datetime;
                    date = moment(logs[i].datetime, 'X').locale('fr').format('L');
                    duration = logs[i].duration;
                }
            }

            if(mode == 1)
                maxLogDown.push({"date":date, "duration":this.convertSecondIntoTime(duration), "timestamp":duration});
            else
                maxLogDown.push({"date":dateInSecond, "duration":this.convertSecondIntoTime(duration), "timestamp":duration});
            return maxLogDown;
            
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

<style>

</style>