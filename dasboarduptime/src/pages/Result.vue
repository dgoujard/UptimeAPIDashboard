<template>
    <div id="table">
        <Header @searchInTab="searchInTab" @downloadCsv="downloadCsv" :hasSearch="hasSearch" :keyRoute="key" :date="date" :searchinput="search" :accounts="accounts" :idAccount="idAccount"></Header>
        <div v-if="search != ''" class="text-center itemSearch" style="color:#e9ecef">
            <p id="text">Recherche : {{search}}</p>
            <p id="nbLine">Nombre de résultats : {{filter.length}}</p>
        </div>
        <div id="accordion" class="bg-dark">

            <div class="card">
                <div class="card-header d-flex flex-row-reverse">
                    <a class="collapsed card-link" data-toggle="collapse" href="#collapseTwo">
                        Plages horaires
                        <span class="fas fa-angle-double-down" aria-hidden="true"></span>
                    </a>
                </div>
                <div id="collapseTwo" class="collapse" data-parent="#accordion">
                    <div class="card-body">
                        <div class="form-row">                            
                            <div class="col-md-3 mb-3">
                                <label for="Heure1">Heures</label>
                                <select class="form-control" id="Heure1" v-model="firstHour">
                                    <option v-for="item in hours" :val="item">{{item}}</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="Minute1">Minutes</label>
                                <select class="form-control" id="Minute1" v-model="firstMinute">
                                    <option v-for="item in minutes" :val="item">{{item}}</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="Heure2">Heures</label>
                                <select class="form-control" id="Heure1" v-model="secondHour">
                                    <option v-for="item in hours" :val="item">{{item}}</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="Minute2">Minutes</label>
                                <select class="form-control" id="Minute2" v-model="secondMinute">
                                    <option v-for="item in minutes" :val="item">{{item}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="m-4">
                            <div v-for="item in days" :val="item" class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" :id="item" :value="item" v-model="daysSelected">
                                <label class="form-check-label" :for="item">{{item}}</label>
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary btn-lg btn-block" @click.prevent="searchWithHoraire">Valider</button>
                    </div>
                </div>
            </div>
        </div>

        <Table v-if="results != ''" @sortBy="sortBy" @displayRow="displayRow" :months="months" :data="filter" :average="average" :keyAccount="key" :date="date" :search="search" :idAccount="idAccount"></Table>
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
import Table from '@/components/Table';
import Planner from '@/components/Planner';

export default {
    name : 'Result',
    components: {
      Header, Table, Planner
    },
    data(){
        return{
            sortKey: '',
            date : null,
            results : [],
            filter : [],
            average : [],
            csv : null,
            search : '',
            reverse: false,
            hasSearch : true,
            key:'',
            idAccount: '',
            firstHour:'',
            firstMinute:'',
            secondHour:'',
            secondMinute:'',
            daysSelected: [],
            days: ["monday", "tuesday", "wednesday","thursday", "friday", "saturday", "sunday"],
            hours: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
            minutes: ["00", "15", "30", "45"],
            custom_interval:["0", "86400"],
            accounts: process.env.Accounts,
        } 
    },
    computed: {
        range :{
            get : function(){
                let months = Array()
                let currentDate

                let year = moment().format('YYYY')
                if("year" in this.$route.params && parseInt(year) != this.$route.params.year){
                    this.date = this.$route.params.year
                    currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X')
                }else{
                    this.date = moment().format('YYYY')
                    currentDate = moment().format('X')
                }
                let startMonth = moment(currentDate, 'X').startOf('month').format('X')
                let startYear = moment(currentDate, 'X').startOf('year').format('X')
                let rang = ""+startMonth+"_"+currentDate+""
                months.push(rang)

                let dateInTheMonth = startMonth-1 
                let startBefore = startMonth
                while(dateInTheMonth>startYear){
                    let startMonth = moment(dateInTheMonth, 'X').startOf('month').format('X')
                    let endMonth = startBefore
                    startBefore = startMonth
                    rang = ""+startMonth+"_"+endMonth+""
                    months.push(rang)
                    dateInTheMonth = startMonth-1
                }
                let monthRange = months.join('-')
                let range = monthRange

                return range
            }
        },
        months:{
            get : function(){
                let months = Array()
                let currentDate = parseInt(moment().format('X'))

                let year = moment().format('YYYY')
                if("year" in this.$route.params && parseInt(year) != this.$route.params.year)
                    currentDate = parseInt(moment(this.$route.params.year, 'YYYY').endOf('year').format('X'))


                let startMonth = parseInt(moment(currentDate, 'X').startOf('month').format('X'))


                let startYear = moment(currentDate, 'X').startOf('year').format('X')
                months.push(moment(currentDate, 'X').locale('fr').format('MMM'))
                let dateInTheMonth = startMonth-1
                while(dateInTheMonth>startYear){
                    let name = moment(dateInTheMonth, 'X').locale('fr').format('MMM')
                    startMonth = parseInt(moment(dateInTheMonth, 'X').startOf('month').format('X'))
                    months.unshift(name)
                    dateInTheMonth = startMonth-1 
                }

                return months
            }
        },
    },
    created(){
        this.getData()
    },
    watch: {
        '$route': 'getData'
    },
    methods : {
        searchWithHoraire: function(){
            let firstHour = parseInt(this.firstHour)*3600 + parseInt(this.firstMinute) * 60;
            let secondHour = parseInt(this.secondHour)*3600 + parseInt(this.secondMinute) * 60;
            this.custom_interval = [firstHour.toString(), secondHour.toString()]
            console.log(this.daysSelected)
            this.getData()
        },
        getMoyenne: function(){
            let vm = this
            var filter = vm.filter
            var ranges = []
            vm.average = ["Moyenne"]
            filter.forEach(function(element) { 
                if(element["isVisible"])
                    ranges.push(element["ranges"])
            })
            if(typeof ranges[0] !== "undefined") {
                var lengthArray = ranges[0].length

                const reducer = (accumulator, currentValue) => accumulator + currentValue;
            
                for(var i = 0; i<lengthArray; i++){
                    var arrayElement = []
                    for(var j = 0; j<ranges.length; j++){
                        if(ranges[j][i] != 0)
                            arrayElement.push(ranges[j][i])
                    }

                    if(arrayElement.length != 0){
                        vm.average.push((arrayElement.reduce(reducer)/arrayElement.length).toFixed(3))
                    }
                    else 
                        vm.average.push('nc')
                }
                vm.average.push('','','', '')
            } else {
                vm.average = [];
            }
        },

        getData: async function(){
            let vm = this
            
            vm.results = await vm.getUptimeData()
            vm.filter = vm.results

            if(vm.search != "")
                vm.searchInTab(vm.search)
            else 
                if(typeof vm.$route.params.search !== "undefined")
                {
                    if(vm.$route.params.search != "")
                        vm.searchInTab(vm.$route.params.search)
                }

            vm.getMoyenne()
        },
        getUptimeData: async function(){
            let vm = this
            let currentDate
            var results = []
            let year = moment().format('YYYY')
            if("year" in this.$route.params && parseInt(year) != this.$route.params.year)
                currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X')
            else
                currentDate = moment().format('X')

            let startYear = moment(currentDate, 'X').startOf('year').format('X')
            
            let route = ''

            if(this.$route.params.id !== undefined){
                vm.idAccount = this.$route.params.id
            } else {
                vm.idAccount = '0';
            }

            if(this.$route.params.key !== undefined){
                route = this.$route.params.key
            } else {
                route = vm.accounts[vm.idAccount]["key"]
            }
            vm.key = route
            let data = {
                "account":route,
                "ranges":this.range,
                "custom_interval":this.custom_interval,
                "custom_days_range":this.daysSelected
            }
            let url = 'http://localhost:3000/siteslogs'
            await axios.post(url, data).
            then(function (response) {
                var monitors = response.data
                for(var i in monitors){
                    var logs = monitors[i].logs
                    const reducer = (accumulator, currentValue) => accumulator + currentValue;
                    var logsDuration = Array()
                    for(var j in logs)
                        if(logs[j].type == 1)
                            logsDuration.push(logs[j].duration)
                    
                    
                    if(logsDuration.length > 0){
                        var cumul = vm.convertSecondIntoTime(logsDuration.reduce(reducer))
                        var secondeCumul = logsDuration.reduce(reducer)
                    }else{ 
                        var cumul = 0;
                        var secondeCumul = 0
                    }

                    let range = monitors[i].custom_uptime_ranges
                    let ranges = range.split('-').reverse()
                    let longerLogDown = vm.searchForLongerLog(monitors[i].logs, 1)   
                    var total = 0;
                    var numberRange = 0
                    
                    for(var k in ranges){
                        if(ranges[k] !== "0.000"){
                            numberRange = numberRange + 1
                            total = total + parseFloat(ranges[k])
                        }
                    }

                    if(total === 0)
                        ranges.unshift("0.000")
                    else 
                        ranges.unshift((total/numberRange).toFixed(3))
                    results.push({
                        "status":monitors[i].status,
                        "id":monitors[i].id,
                        "name":monitors[i].friendly_name,
                        "ranges": ranges.map(Number),
                        "cumul":cumul,
                        "cumulSeconde":secondeCumul,
                        "longerLogDown":longerLogDown,
                        "timestampLogdown": longerLogDown[0]["timestamp"],
                        "url":monitors[i].url,
                        "isVisible":true
                    })
                }
            })
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
                    })
            }
            var csv = jsoncsv({data : json, del : ";"})
            var hiddenElement = document.createElement('a')
            document.body.appendChild(hiddenElement)
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
            hiddenElement.target = '_blank'
            
            if(this.search != "")
                hiddenElement.download = 'uptime_robot_synthese_'+this.search+'.csv'
            else 
                hiddenElement.download = 'uptime_robot_synthese.csv'

            hiddenElement.click()
        },
        sortBy: function(name){
            var vm = this
            var sortby = "";

            if(Number.isInteger(name))
                sortby = "[\'ranges\']["+name+"]"
            else 
                sortby = name
            
            if (vm.sortKey === sortby) {
                vm.reverse = !vm.reverse;
            } else {
                vm.reverse = true;
                vm.sortKey = sortby;
            }
        

            var ascending = vm.reverse;
            vm.filter.sort(function(a, b) {
                if(Number.isInteger(name)){
                    var valueA, valueB = null              
                    valueA = a["ranges"][name]
                    valueB = b["ranges"][name]
                    if (valueA > valueB) {
                        return ascending ? 1 : -1
                    } else if (valueA < valueB) {
                        return ascending ? -1 : 1
                    }
                } else {
                    if(sortby == "name"){
                        if (a[sortby].toUpperCase() > b[sortby].toUpperCase()) {
                            return ascending ? 1 : -1
                        } else if (a[sortby].toUpperCase() < b[sortby].toUpperCase()) {
                            return ascending ? -1 : 1
                        }
                    }else{ 
                        if (a[sortby] > b[sortby]) {
                            return ascending ? 1 : -1
                        } else if (a[sortby] < b[sortby]) {
                            return ascending ? -1 : 1
                        }
                    }
                }
                
                return 0;
            })


        },
        displayRow: function(index){
            var vm = this
            vm.filter[index]["isVisible"]= !vm.filter[index]["isVisible"]
            vm.getMoyenne()
        },
        searchInTab: function(value){    
            var vm = this
            var result = vm.results.filter(element => element.name.toUpperCase().includes(value.toUpperCase()))
            vm.filter = result
            vm.search = value
            vm.getMoyenne()
        },
        searchForLongerLog: function(log, mode){
            let date = 0
            let duration = 0
            let dateInSecond = 0
            let logs = Array()
            let logsDown = Array()
            let maxLogDown = Array() 
            let maxLogDownInSecond = Array()

            if(mode == 1){
              for(var i in log){
                if(log[i].type == 1){
                    logs.push(log[i])
                }
              }
            }else{
                logs = log
            }
            for (var i in logs){
                if (logs[i].duration>duration){
                    dateInSecond = logs[i].datetime
                    date = moment(logs[i].datetime, 'X').locale('fr').format('L')
                    duration = logs[i].duration
                }
            }

            if(mode == 1)
                maxLogDown.push({"date":date, "duration":this.convertSecondIntoTime(duration), "timestamp":duration})
            else
                maxLogDown.push({"date":dateInSecond, "duration":this.convertSecondIntoTime(duration), "timestamp":duration})
            return maxLogDown
            
        }, 
        convertSecondIntoTime: function(second){
            let time = 0
            let days = moment.duration(second, 'seconds').days()
            let hours = moment.duration(second, 'seconds').hours()
            let minutes = moment.duration(second, 'seconds').minutes()
            let seconds = moment.duration(second, 'seconds').seconds()
            
            if(days == "0" && hours == "0" && minutes == "0" )
                time = seconds+" s"
            else if(days == "0" && hours == "0")
                time = minutes+"m"+seconds+"s"
            else if(days == "0")
                time = hours+"h"+minutes+"m"+seconds+"s"
            else
                time = days+"j"+hours+"h"+minutes+"m"+seconds+"s"

            return time
        },
    },
}

</script>
<style>
.date {
    color: #fff;
    font-size: 1.25rem
}

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

#accordion {
    width: 90%;
    max-width: 90%;
    padding-right: 0px;
    padding-left: 0px;
    margin-right: auto;
    margin-left: auto;
}
.card-link {
    color: #fff;
}
</style>



