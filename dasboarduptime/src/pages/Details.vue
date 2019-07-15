<template>
    <div>
        <Header :hasSearch="hasSearch"></Header>
        <div class="container">
            <div class="card border-primary card-background" v-if="details != ''">
            <div class="Detail"  v-for="detail in details " :key="detail.id" >
                <div class="col-lg-12">
                    <div class="row entete card-header">
                        <div class="col-md-1 icondispo">
                            <div v-if="detail.status==2"><span class="fa fa-check-circle" aria-hidden="true"></span></div>
                            <div v-if="detail.status==9"><span class="fa fa-exclamation-circle" aria-hidden="true"></span></div>
                            <div v-if="detail.status==8"><span class="fa fa-times-circle" aria-hidden="true"></span></div>
                        </div>
                        <div class="col-md-9">
                            <div class="title">
                                <h1>
                                    {{detail.name}}
                                </h1>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <router-link :to="{name:$route.params.from.name, 
                                params:{
                                    id:$route.params.idAccount,
                                    key:$route.params.key,
                                    year: $route.params.date,
                                    search: $route.params.search,
                                    interval:$route.params.interval,
                                    daysSelected:$route.params.daysSelected
                                }
                            }" tag="button" class="btn btn-lg btn-secondary btn-block">Retour à la liste
                            </router-link>    
                        </div>
                    </div>
                </div>

                <div class="card-body">
                <div class="row">
                    <div class="col-lg-12">
                        <Table v-if="filter != ''" :months="months" :data="filter" :average="[]" :keyAccount="$route.params.key" :date="date" :search="''" :idAccount="$route.params.idAccount" :custom_interval="$route.params.interval" :daysSelected="$route.params.daysSelected" :hasSort="false" :hasDisplayRow="false" :hasAverage="false" :hasSearch="false"></Table>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-9">
                        <div class="card border-primary">
                            <div class="card-header">
                                <div class="col-xs-9 text-center">
                                    <strong>Disponibilité sur les 4 dernières semaines en %</strong>
                                </div>
                            </div>
                            <div class="card-body text-center">
                                <div class="row">
                                    <div class="col-lg-3 text-center">
                                        <p class="dateranges">
                                            <strong>{{jours[0]}}</strong>
                                        </p>

                                        <div class="progress">
                                          <div v-if="detail.ranges[3] > '99,9' || detail.ranges[3] == '100,000'" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[3] + '%'}"  v-bind:aria-valuenow="detail.ranges[3]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[3]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[3] >'99,6'" class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[3] + '%'}"  v-bind:aria-valuenow="detail.ranges[3]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[3]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[3] <'99,6'" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[3] + '%'}"  v-bind:aria-valuenow="detail.ranges[3]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[3]}} %</strong></div>
                                        </div>

                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <p class="dateranges">
                                            <strong>{{jours[1]}}</strong>
                                        </p>
                                        <div class="progress">
                                          <div v-if="detail.ranges[2] > '99,9' || detail.ranges[2] == '100,000'" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[2] + '%'}"  v-bind:aria-valuenow="detail.ranges[2]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[2]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[2] >'99,6'" class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[2] + '%'}"  v-bind:aria-valuenow="detail.ranges[2]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[2]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[2] <'99,6'" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[2] + '%'}"  v-bind:aria-valuenow="detail.ranges[2]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[2]}} %</strong></div>
                                        </div>
                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <p class="dateranges">
                                            <strong>{{jours[2]}}</strong>
                                        </p>
                                        <div class="progress">
                                          <div v-if="detail.ranges[1] > '99,9' || detail.ranges[1] == '100,000'" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[1] + '%'}"  v-bind:aria-valuenow="detail.ranges[1]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[1]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[1] >'99,6'" class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[1] + '%'}"  v-bind:aria-valuenow="detail.ranges[1]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[1]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[1] <'99,6'" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[1] + '%'}"  v-bind:aria-valuenow="detail.ranges[1]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[1]}} %</strong></div>
                                        </div>
                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <p class="dateranges">
                                            <strong>{{jours[3]}}</strong>
                                        </p>
                                        <div class="progress">
                                          <div v-if="detail.ranges[0] > '99,9' || detail.ranges[0] == '100,000'" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[0] + '%'}"  v-bind:aria-valuenow="detail.ranges[0]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[0]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[0] >'99,6'" class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[0] + '%'}"  v-bind:aria-valuenow="detail.ranges[0]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[0]}} %</strong></div>
                                          <div  v-else-if="detail.ranges[0] <'99,6'" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[0] + '%'}"  v-bind:aria-valuenow="detail.ranges[0]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[0]}} %</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3">
                        <div class="card border-primary total">
                            <div class="card-header">
                                <div class="col-xs-9 text-center ">
                                    <strong>Total des indisponibilités sur l'année</strong>
                                </div>
                            </div>
                            <div class="card-body text-center">
                                <span v-if="allLogs == 'empty'" class="badge badge-success">0</span>
                                <span v-else class="badge badge-dark">{{allLogs.length}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-4">
                        <div class="card border-primary">
                            <div class="card-header">
                                <div class="col-xs-9 text-center">
                                     <strong>Disponibilité globale en % </strong>
                                </div>   
                            </div>
                            <div class="card-body text-center global"> 
                                <p v-if="range == '0,000'">nc</p>
                                <div v-if="detail.ranges[4] > '99,9' || detail.ranges[4] == '100,000'" class="progress" style="height:70px">
                                  <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[4] + '%'}" v-bind:aria-valuenow="detail.ranges[4]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[4]}} %</strong></div>
                                </div>
                                <div v-else-if="detail.ranges[4] >'99,6'" class="progress" style="height:70px">
                                  <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[4] + '%'}" v-bind:aria-valuenow="detail.ranges[4]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[4]}} %</strong></div>
                                </div>
                                <div v-else-if="detail.ranges[4] <'99,6'" class="progress" style="height:70px">
                                  <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" v-bind:style="{'width':detail.rangesW[4] + '%'}" v-bind:aria-valuenow="detail.ranges[4]" aria-valuemin="0" aria-valuemax="100"><strong>{{detail.ranges[4]}} %</strong></div>
                                </div>
                            </div>
                        </div>    
                    </div>
                    <div class="col-lg-4">
                        <div class="card border-primary">
                            <div class="card-header">
                                <div class="col-xs-9 text-center">
                                     <strong>Toutes les indisponibilités </strong>
                                </div>
                            </div>
                            <div class="card-body text-center lastlogs">
                                <div v-if="detail.logs == 'empty'">
                                    <p>
                                        Aucune
                                    </p>
                                </div>
                                <div v-else>
                                    <table class="table table-hover table-striped table-fixed table-sm" id="tableLogs">
                                        <thead>
                                            <th>Date</th>
                                            <th>Durée</th>
                                        </thead>
                                        <tbody>
                                            <tr v-for="logs in detail.logs " :key="logs.id">
                                                <td :id="logs.datetime">
                                                    {{logs.date}}
                                                </td>
                                                <td :id="logs.timestamp">
                                                    {{logs.duration}}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                  
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card border-primary">
                            <div class="card-header">
                                <div class="col-xs-9 text-center">
                                     <strong>Plus longue indisponibilité </strong>
                                </div>
                            </div>
                            <div class="card-body text-center ">
                                <div v-for="logs in detail.longerLogDown " :key="logs.id">
                                    <p v-if="logs.date == '0'">
                                        Aucune
                                    </p>
                                    <p v-else class="log"> 
                                        {{logs.date}} : {{logs.duration}}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import Header from '@/components/Header';
import Table from '@/components/Table';

export default {
    components: {
        Header, Table
    },
    data(){
        return{
            details : [{'name':'test'}],
            allLogs : [],
            jours : [],
            hasSearch : false,
            filter: [],
            date: null
        } 
    },
    computed: {
        range :{
            get : function(){
                let currentDate = moment().format('X')
                let startYear = moment(currentDate, 'X').startOf('year').format('X')
                let yearRange = ""+startYear+"_"+currentDate+""

                let startFirstWeek = parseInt(moment(currentDate, 'X').startOf('week').format('X'))+86400
                let endFirstWeek = parseInt(moment(currentDate, 'X').endOf('week').format('X'))+86400
                let firstWeek = ""+startFirstWeek+"_"+currentDate+""
                let week1 = "Du "+moment(startFirstWeek, 'X').locale('fr').format('L')+" à Aujourd'hui"
                let secondWeek = ""+(startFirstWeek-604800)+"_"+(endFirstWeek-604800)+""
                let week2 = "Du "+moment((startFirstWeek-604800), 'X').locale('fr').format('L')+" au "+moment((endFirstWeek-604800), 'X').locale('fr').format('L')
                let thirdWeek = ""+(startFirstWeek-604800*2)+"_"+(endFirstWeek-604800*2)+""
                let week3 = "Du "+moment((startFirstWeek-604800*2), 'X').locale('fr').format('L')+" au "+moment((endFirstWeek-604800*2), 'X').locale('fr').format('L')
                let fourthWeek = ""+(startFirstWeek-604800*3)+"_"+(endFirstWeek-604800*3)+""
                let week4 = "Du "+moment((startFirstWeek-604800*3), 'X').locale('fr').format('L')+" au "+moment((endFirstWeek-604800*3), 'X').locale('fr').format('L')

                this.jours = [week4, week3, week2, week1]

                let range = yearRange+"-"+fourthWeek+"-"+thirdWeek+"-"+secondWeek+"-"+firstWeek
                return range
            }
        },
        months:{
            get : function(){
                let months = Array()
                let currentDate = parseInt(moment().format('X'))

                let year = moment().format('YYYY')
                if("year" in this.$route.params && parseInt(year) != this.$route.params.year){
                    currentDate = parseInt(moment(this.$route.params.year, 'YYYY').endOf('year').format('X'))
                    this.date = this.$route.params.year;
                } else {
                    this.date = moment().format('YYYY')
                }
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
    filters: {
        formatNumber (value) {
            return value.replace(',', '.');
        }
    },
    created(){
        this.getData()
    },
    watch: {
        '$route': 'getData'
    },
    methods : {
        getData: async function(){
            let vm = this
            vm.details = await vm.getDataUptime()
        },
        getDataUptime: async function(){
            let vm = this
            let currentDate = moment().format('X')
            let startYear = moment(currentDate, 'X').startOf('year').format('X')
            var results = []
            let data = {
                "site":[parseInt(vm.$route.params.id)],
                "ranges":this.range,
                "custom_interval":vm.$route.params.interval,
                "custom_days_range":vm.$route.params.daysSelected
            }
            let detail = Array()
            let url = 'https://apiuptime.swarm.actigraph.com/siteslogs'
            axios.post(url, data).
            then(function (response) {
                for(var i in response.data){
                    let logDown
                    let longerLogDown = vm.searchForLongerLog(response.data[i].logs, 1)
                    let ranges = ((response.data[i].custom_uptime_ranges.replace(/\./g, ',')).split('-')).reverse()
                    let rangeW = ((response.data[i].custom_uptime_ranges).split('-')).reverse()
                    if(vm.searchForLongerLog(response.data[i].logs, 2).length == 0){
                        vm.allLogs = "empty"
                    }else{
                        vm.allLogs = vm.searchForLongerLog(response.data[i].logs, 2)
                        vm.allLogs = vm.allLogs.reduce((unique, o) => {
                            if(!unique.some(obj => obj.label === o.label && obj.value === o.value)) {
                            unique.push(o);
                            }
                            return unique;
                        },[]);
                    } 
                    results.push({
                        "name":response.data[i].friendly_name,
                        "status":response.data[i].status,
                        "ranges":ranges,
                        "rangesW":rangeW,
                        "logs":vm.allLogs,
                        "longerLogDown":longerLogDown,
                        "url":""
                    })

                    vm.filter = [{
                        "status":response.data[i].status,
                        "id":response.data[i].id,
                        "name":response.data[i].friendly_name,
                        "ranges": [],
                        "cumul":"cumul",
                        "cumulSeconde":"",
                        "longerLogDown":longerLogDown,
                        "timestampLogdown": longerLogDown[0]["timestamp"],
                        "url":response.data[i].url,
                        "isVisible":true
                    }]

                    console.log(vm.filter);

                }
            })
            return results;
        },
        searchForLongerLog : function (log, mode){
            let date = 0
            let duration = 0
            let logs = Array()
            let logsDown = Array()
            let maxLogDown = Array()    
            for(var i in log){
                if(log[i].type == 1){
                    logs.push(log[i])
                }
            }
            for (var i in logs){
                logsDown.push({"date": moment(logs[i].datetime, 'X').locale('fr').format('L'),"datetime":logs[i].datetime, "duration":this.convertSecondIntoTime(logs[i].duration), "timestamp":logs[i].duration} )
                if (logs[i].duration>duration){
                    date = moment(logs[i].datetime, 'X').locale('fr').format('L')
                    duration = logs[i].duration
                }
            }
            
            maxLogDown.push({"date":date, "duration":this.convertSecondIntoTime(duration), "timestamp":duration})
            if(mode == 1)
                return maxLogDown
            else
                return logsDown
        },
        convertSecondIntoTime : function (second){
            let time = 0
            let days = moment.duration(second, 'seconds').days()
            let hours = moment.duration(second, 'seconds').hours()
            let minutes = moment.duration(second, 'seconds').minutes()
            let seconds = moment.duration(second, 'seconds').seconds()
            
            if(days == "0" && hours == "0" && minutes == "0" )
                time = seconds+"s"
            else if(days == "0" && hours == "0")
                time = minutes+"m"+seconds+"s"
            else if(days == "0")
                time = hours+"h"+minutes+"m"+seconds+"s"
            else
                time = days+"j"+hours+"h"+minutes+"m"+seconds+"s"

            return time
        }
    }
}
</script>
