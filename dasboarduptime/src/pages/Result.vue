<template>
    <div id="result">
        <Header @addFavorites="addFavorites" @searchInTab="searchInTab" @downloadCsv="downloadCsv" :hasSearch="hasSearch" :date="date" :searchinput="search" :accounts="accounts" :idAccount="idAccount" :nbElement="filter.length"></Header>
        <Favorites @removeFavorite="removeFavorite" v-if="favorites != ''" class="container favorites-cp mb-5" @searchInTab="searchInTab" :favorites="favorites"></Favorites>
        <PlageHoraire @searchWithHoraire="searchWithHoraire" :custominterval="custom_interval" :startDate="startDate" :endDate="currentDate" :limitStart="limitStart" :limitEnd="limitEnd"></PlageHoraire>
        <div class="container table-year">
            <Table @sortBy="sortBy" @displayRow="displayRow" :months="months" :data="filter" :average="average" :date="date" :search="search" :idAccount="idAccount" :custom_interval="custom_interval" :daysSelected="daysSelected" :hasSort="true" :hasDisplayRow="true" :hasAverage="true" :hasIndispoInfo="true" :processing="processing"></Table>
        </div>
        <nav class="navbar fixed-bottom navbar-expand-lg navbar-dark bg-dark">
            <a href="#" class="navbar-brand">Réal. Actigraph</a>
        </nav>
    </div>
</template>

<script>
import axios from 'axios'
import moment,{ duration } from 'moment'
import jsoncsv from 'json2csv'
import Header from '@/components/Header';
import Favorites from '@/components/Favorites';
import Table from '@/components/Table';
import PlageHoraire from '@/components/PlageHoraire';
export default {
    name : 'Result',
    components: {
      Header, Table, PlageHoraire, Favorites
    },
    data(){
        return{
            favorites: [],
            sortKey: '',
            date : null,
            results : [],
            filter : [],
            average : [],
            csv : null,
            search : '',
            reverse: false,
            hasSearch : true,
            idAccount: '',
            daysSelected:[],
            custom_interval:["0", "86400"],
            accounts: process.env.Accounts, 
            processing:true,
            currentDate: moment().format('X'),
            currentStartDate: null,
            startDate: null,
            endDate: null,
            months:[],
            range: ''
        };
    },
    mounted() {
        if (localStorage.uptimefavorites) {
            this.favorites = JSON.parse(localStorage.uptimefavorites);
        }
    },
    created(){
        this.getData();
    },
    watch: {
        '$route': 'getData'
    },
    computed : {
        limitStart: {
            get:function(){
                let start = moment(moment().format('X'), 'X').startOf('year').format('X');
                return start;
            },
        },
        limitEnd: {
            get:function(){
                let end = "";
                let year = moment().format('YYYY');
                if("year" in this.$route.params && parseInt(year) != this.$route.params.year)
                    end = moment(this.$route.params.year, 'YYYY').endOf('year').format('X');
                else 
                    end = moment().format('X');

                return end;
            },
        },
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
        removeFavorite : function(val){
            var index = this.favorites.indexOf(val);
            if (index > -1) {
                this.favorites.splice(index, 1);
            }
            localStorage.setItem("uptimefavorites", JSON.stringify(this.favorites));
        },
        addFavorites : function(val){
            this.favorites.push(val)
            localStorage.setItem("uptimefavorites", JSON.stringify(this.favorites));
        },
        getMoyenne: function(){
            let vm = this;
            var filter = vm.filter;
            var ranges = [];
            vm.average = ["Moyenne"];
            filter.forEach(function(element) { 
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
                vm.average.push('','','', '');
            } else {
                vm.average = [];
            }
        },
        searchWithHoraire: function(interval, days, start, currentDate){
            this.custom_interval = interval;
            this.daysSelected = days;
            this.currentStartDate = start;
            this.currentDate = currentDate;

            this.getData();
        },
        getData: async function(){
            let vm = this;
            vm.getRange();
            vm.getMonth();
            vm.results = await vm.getUptimeData();
            vm.filter = vm.results;
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
                        for(var j in logs)
                            if(logs[j].type == 1)
                                logsDuration.push(logs[j].duration);
                        
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
                        vm.getMoyenne();
                    }      
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
        downloadCsv: function(e){
            var json = Array()
            for(var i in this.filter){
                if(this.filter[i].isVisible)
                    json.push({
                        "Nom":this.filter[i].name,
                        "Disponibilité globale":(typeof this.filter[i].ranges[0] !== "undefined" ?  (this.filter[i].ranges[0]).toString().replace(".", ",") : ""),
                        "Janvier":(typeof this.filter[i].ranges[1] !== "undefined" ?  (this.filter[i].ranges[1]).toString().replace(".", ",") : ""),
                        "Février":(typeof this.filter[i].ranges[2] !== "undefined" ?  (this.filter[i].ranges[2]).toString().replace(".", ",") : ""),
                        "Mars":(typeof this.filter[i].ranges[3] !== "undefined" ?  (this.filter[i].ranges[3]).toString().replace(".", ",") : ""),
                        "Avril":(typeof this.filter[i].ranges[4] !== "undefined" ?  (this.filter[i].ranges[4]).toString().replace(".", ",") : ""),
                        "Mai":(typeof this.filter[i].ranges[5] !== "undefined" ?  (this.filter[i].ranges[5]).toString().replace(".", ",") : ""),
                        "Juin":(typeof this.filter[i].ranges[6] !== "undefined" ?  (this.filter[i].ranges[6]).toString().replace(".", ",") : ""),
                        "Juillet":(typeof this.filter[i].ranges[7] !== "undefined" ?  (this.filter[i].ranges[7]).toString().replace(".", ",") : ""),
                        "Août":(typeof this.filter[i].ranges[8] !== "undefined" ?  (this.filter[i].ranges[8]).toString().replace(".", ",") : ""),
                        "Septembre":(typeof this.filter[i].ranges[9] !== "undefined" ?  (this.filter[i].ranges[9]).toString().replace(".", ",") : ""),
                        "Octobre":(typeof this.filter[i].ranges[10] !== "undefined" ?  (this.filter[i].ranges[10]).toString().replace(".", ",") : ""),
                        "Novembre":(typeof this.filter[i].ranges[11] !== "undefined" ?  (this.filter[i].ranges[11]).toString().replace(".", ",") : ""),
                        "Décembre":(typeof this.filter[i].ranges[12] !== "undefined" ?  (this.filter[i].ranges[12]).toString().replace(".", ",") : ""),
                        "Plus longue indisponibilté":this.filter[i].longerLogDown[0].date,
                        "Durée":this.filter[i].longerLogDown[0].duration,
                        "Durée en seconde":this.filter[i].longerLogDown[0].timestamp
                    });
            }
            var csv = jsoncsv({data : json, del : ";"});
            var hiddenElement = document.createElement('a');
            document.body.appendChild(hiddenElement);
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            
            if(this.search != "")
                hiddenElement.download = 'uptime_robot_synthese_'+this.search+'.csv';
            else 
                hiddenElement.download = 'uptime_robot_synthese.csv';

            hiddenElement.click();
        },
        sortBy: function(name){
            var vm = this;
            var sortby = "";

            if(Number.isInteger(name))
                sortby = "[\'ranges\']["+name+"]";
            else 
                sortby = name;
            
            if (vm.sortKey === sortby) {
                vm.reverse = !vm.reverse;
            } else {
                vm.reverse = true;
                vm.sortKey = sortby;
            }
            var ascending = vm.reverse;
            vm.filter.sort(function(a, b) {
                if(Number.isInteger(name)){
                    var valueA, valueB = null;          
                    valueA = a["ranges"][name];
                    valueB = b["ranges"][name];
                    if (valueA > valueB) {
                        return ascending ? 1 : -1;
                    } else if (valueA < valueB) {
                        return ascending ? -1 : 1;
                    }
                } else {
                    if(sortby == "name"){
                        if (a[sortby].toUpperCase() > b[sortby].toUpperCase()) {
                            return ascending ? 1 : -1;
                        } else if (a[sortby].toUpperCase() < b[sortby].toUpperCase()) {
                            return ascending ? -1 : 1;
                        }
                    }else{ 
                        if (a[sortby] > b[sortby]) {
                            return ascending ? 1 : -1;
                        } else if (a[sortby] < b[sortby]) {
                            return ascending ? -1 : 1;
                        }
                    }
                }
                
                return 0;
            })
        },
        displayRow: function(index){
            var vm = this;
            vm.filter[index]["isVisible"]= !vm.filter[index]["isVisible"];
            vm.getMoyenne();
        },
        searchInTab: function(value){    
            var vm = this;
            var result = vm.results.filter(element => element.name.toUpperCase().includes(value.toUpperCase()));
            vm.filter = result;
            vm.search = value;
            vm.getMoyenne();
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
        },
    },
}

</script>
<style>

.MoyenneHeaders {
    line-height: 2%;
}

.MoyenneHeaders th{
    font-size: 12px
}

table thead th {
    border-bottom: 0 !important;
    height: 10px !important;
}

.not-visible * {
    opacity: 0.4;
    filter: alpha(opacity=80)
}
.favorites-cp {
    width: 90%;
    padding-right: 0px;
    padding-left: 0px;
    margin-right: auto;
    margin-left: auto;
}
</style>



