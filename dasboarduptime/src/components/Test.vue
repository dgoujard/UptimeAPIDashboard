<template>
    <div>
        <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark" role="navigation">
            <router-link :to="{name:'Result'}"><a class="navbar-brand" href="#">Disponibilité - Statistiques</a></router-link>
            <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                        <router-link :to="{name:'History', params:{year:'2016'}}" tag="button" class="btn btn-outline-primary mr-sm-2">2016</router-link>
                        <router-link :to="{name:'History', params:{year:'2017'}}" tag="button" class="btn btn-outline-primary mr-sm-2">2017</router-link>                          
                        <router-link :to="{name:'Result'}" tag="button" class="btn btn-outline-primary mr-sm-2">2018</router-link>

                        <button class="btn btn-outline-primary my-2 my-sm-0" type="" @click.prevent="downloadCsv">Télécharger au format CSV</button>  
                    </ul>
              </div>
        </nav>
        <div class="container">
            <table class="table table-lg" id="data">
                <thead>
                    <tr>
                        <th scope="col">Nom</th>
                        <th scope="col">Disponibilité globale en %</th>
                        <th scope="col" v-for="month in months " :key="month.id">{{month}}</th>
                    </tr>    
                </thead>
                <tbody>
                    
                </tbody>
            </table>
        </div>
    </div>  
</template>
    

<script>
import axios from 'axios'
import moment,{ duration } from 'moment'
import jsoncsv from 'json2csv'

export default {
    name : 'Test',
    data(){
        return{
            date : null,
            results : [],
            csv : null,
            search : localStorage.getItem('test'),
            reverse: false,
        } 
    },
    created(){
        this.getData()
        
    },
    computed: {
        data : {
            get : function(){
                return this.getData()
            }
        },
        range :{
            get : function(){
                let months = Array()
                let currentDate
                if("year" in this.$route.params){
                    this.date = this.$route.params.year
                    currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X')
                }else{
                    this.date = moment().format('YYYY')
                    currentDate = moment().format('X')
                }
                let startYear = moment(currentDate, 'X').startOf('year').format('X')
                let startMonth = moment(currentDate, 'X').startOf('month').format('X')
                let endMonth = moment(currentDate, 'X').endOf('month').format('X')
                let rang = ""+startMonth+"_"+currentDate+""
                months.push(rang)

                let dateInTheMonth = currentDate-2678400 
                while(dateInTheMonth>startYear){
                    let startMonth = moment(dateInTheMonth, 'X').startOf('month').format('X')
                    let endMonth = moment(dateInTheMonth, 'X').endOf('month').format('X')
                    rang = ""+startMonth+"_"+endMonth+""
                    months.push(rang)
                    dateInTheMonth = dateInTheMonth-2678400 
                }
                let monthRange = months.join('-')
                let yearRange = ""+startYear+"_"+currentDate+""
                let range = monthRange+"-"+yearRange

                return range
            }
        },
        months:{
            get : function(){
                let months = Array()
                let currentDate

                if("year" in this.$route.params)
                    currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X')
                 else
                    currentDate = moment().format('X')

                let startYear = moment(currentDate, 'X').startOf('year').format('X')
                months.push(moment(currentDate, 'X').locale('fr').format('MMMM'))
                let dateInTheMonth = currentDate-2678400 
                while(dateInTheMonth>startYear){
                    let name = moment(dateInTheMonth, 'X').locale('fr').format('MMMM')
                    months.unshift(name)
                    dateInTheMonth = dateInTheMonth-2678400 
                }
                
                return months
            }
        },
    },
    methods : {
        getMoyenne: function(){
            let listeMoyennes=['Moyenne']
            let listeTmp={}
            let cpt = 0
            let totalElements={}
            let vm = this
            let moyenne = $('#moyenne')
            moyenne.html("")
            $('#data tbody tr:visible').each(function(rowIndex) {
                $(this).find('.ranges').each(function(cellIndex){
                    if(listeTmp[cellIndex] == undefined)
                        listeTmp[cellIndex] = 0
                    if(totalElements[cellIndex] == undefined)
                        totalElements[cellIndex] = 0
                    if($(this).text() != 'nc'){
                        listeTmp[cellIndex]=listeTmp[cellIndex]+parseFloat(($(this).text()).replace(/\,/g, '.'))
                        if(parseInt($(this).text()) != 0){
                            totalElements[cellIndex]=totalElements[cellIndex]+1
                        }
                    }
                })
            })
            for(var i in listeTmp){
                let moyenne
                if(totalElements[i] != 0){
                    moyenne = ((listeTmp[i]/totalElements[i]).toFixed(3))
                    moyenne = moyenne.replace(/\./g, ',')
                }else{ 
                    moyenne = 'nc'
                }

                listeMoyennes.push(moyenne)
            }
            for(var i in listeMoyennes){
                moyenne.append('<td>'+ listeMoyennes[i]+'</td>')
            }
            let allLog = Array()
            $('#data tbody tr:visible').each(function(rowIndex) {
                let dateTime = ""
                let duration = ""
                $(this).find('.logdownDate').each(function(cellIndex){
                    dateTime = $(this).text().trim()
                })
                $(this).find('.logdownDuration .timestamp').each(function(cellIndex){
                    duration = $(this).text().trim()
                })
                allLog.push({"datetime":dateTime, "duration":parseInt(duration)})
            })
            let longestLog = this.searchForLongerLog(allLog, 2)
            for(var i in longestLog){
                moyenne.append('<td>'+ longestLog[i].date+'</td>')
                moyenne.append('<td>'+ longestLog[i].duration+'</td>')
                moyenne.append('<td></td><td></td>')
            }
           
        },
        getData: async function(){
            let vm = this
            var results = []
            let currentDate
            if("year" in this.$route.params)
                currentDate = moment(this.$route.params.year, 'YYYY').endOf('year').format('X')
            else
                currentDate = moment().format('X')
            let startYear = moment(currentDate, 'X').startOf('year').format('X')
            for(var i = 0; i<2; i++){
                let offset
                if(i == 0)
                    offset = 0
                else 
                    offset = 51
                let data = {
                    "api_key":"u505931-52d5d6c47f0c7d39d6b7a0df",
                    "custom_uptime_ranges":this.range, 
                    "logs":"1",
                    "offset":offset,
                    "logs_start_date":startYear,
                    "logs_end_date":currentDate
                }
                let url = 'https://api.uptimerobot.com/v2/getMonitors'

                try {
                    const response = await axios.post(url, data);
                    var monitors = response.data.monitors
                        for(var i in monitors){
                            var resultMonitors = Array()
                            var logs = monitors[i].logs
                            const reducer = (accumulator, currentValue) => accumulator + currentValue;
                            var logsDuration = Array()

                            for(var j in logs){
                                if(logs[j].type == 1)
                                    logsDuration.push(logs[j].duration)
                            }
                            if(logsDuration.length > 0)
                                var cumul = vm.convertSecondIntoTime(logsDuration.reduce(reducer))
                            else 
                                var cumul = 0
                            let range = monitors[i].custom_uptime_ranges
                            let ranges = ((range.replace(/\./g, ',')).split('-')).reverse()
                            let longerLogDown = vm.searchForLongerLog(monitors[i].logs, 1)     

                            results.push({
                                'id':monitors[i].friendly_name,
                                'name':monitors[i].friendly_name,
                                'ranges':ranges
                            })

                        }
                } catch (error){
                    return error
                }
                $('#data').DataTable({
                    data:results,
                    columns : [
                        {data:'name', "render":function(data, row){
                            console.log(row)
                            return "<a href=''>"+data+"</a>"
                        }},
                        {data:'ranges'}
                    ],
                    stateSave: true,
                    language: {
                        processing: "Traitement en cours...",
                        search: "Rechercher: ",
                        loadingRecords: "Chargement en cours...",
                        lengthMenu: "Afficher _MENU_ éléments",
                        zeroRecords: "Aucun résultat",
                        infoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
                        info: "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
                        emptyTable: "Aucune donnée disponible dans le tableau",
                        paginate: {
                            first: "Premier",
                            previous: "Précédent",
                            next: "Suivant",
                            last: "Dernier"
                        },
                        aria: {
                            sortAscending: ": activer pour trier la colonne par ordre croissant",
                            sortDescending: ": activer pour trier la colonne par ordre décroissant"
                        }
                    }
                })
            
            }
        },
        downloadCsv: function(e){
            var json = Array()
            for(var i in this.results){
                json.push({
                    "Nom":this.results[i].name,
                    "Disponibilité globale":this.results[i].ranges[0],
                    "Janvier":this.results[i].ranges[1],
                    "Février":this.results[i].ranges[2],
                    "Mars":this.results[i].ranges[3],
                    "Avril":this.results[i].ranges[4],
                    "Mai":this.results[i].ranges[5],
                    "Juin":this.results[i].ranges[6],
                    "Juillet":this.results[i].ranges[7],
                    "Août":this.results[i].ranges[8],
                    "Septembre":this.results[i].ranges[9],
                    "Octobre":this.results[i].ranges[10],
                    "Novembre":this.results[i].ranges[11],
                    "Décembre":this.results[i].ranges[12],
                    "Plus longue indisponibilté":this.results[i].longerLogDown[0].date,
                    "Durée":this.results[i].longerLogDown[0].duration,
                    "Durée en seconde":this.results[i].longerLogDown[0].timestamp
                })
            }
            var csv = jsoncsv({data : json, del : ";"})
            var hiddenElement = document.createElement('a')
            document.body.appendChild(hiddenElement)
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
            hiddenElement.target = '_blank'
            hiddenElement.download = 'uptime_robot_synthese.csv'
            hiddenElement.click()
        },
        searchInTab: function(e){
            if(e != null)
                if (e.keyCode === 10 || e.keyCode === 13) 
                    e.preventDefault();
            
            let input = document.getElementById("search");
            let filter = input.value.toUpperCase()
            let table = document.getElementById("results");
            let tr = table.getElementsByTagName("tr");
            let cpt = 0
            
            
            for (var i = 0; i < tr.length; i++) {
                let td = tr[i].getElementsByTagName("td")[0];
                if (td) {
                    if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                        cpt ++
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }                
            }
            if(filter != ""){
                $('.itemSearch #text').text('Recherche : ' +filter)
                $('.itemSearch #nbLine').text('Nombre de résultats : ' +cpt)
            }else{
                $('.itemSearch #text').text('')
                $('.itemSearch #nbLine').text('')
            }
            localStorage.setItem('test', filter)
            this.getMoyenne()
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
                maxLogDown.push(date,this.convertSecondIntoTime(duration), duration)
            else
                maxLogDown.push(dateInSecond, this.convertSecondIntoTime(duration), duration)
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
                time = minutes+" m "+seconds+" s"
            else if(days == "0")
                time = hours+" h "+minutes+" m "+seconds+" s"
            else
                time = days+" j "+hours+" h "+minutes+" m "+seconds+" s"

            return time
        }
    }
}
</script>
