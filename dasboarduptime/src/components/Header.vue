<template>
    <div class="header">
        <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark tablesortable" role="navigation">
            <div class="container">
                <router-link :to="{name:'Result'}"><a class="navbar-brand" href="#">Disponibilité - Statistiques</a></router-link>
                <template v-if="hasSearch == true">
                    <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary my-2 my-sm-0 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {{date}}
                            </button>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <h6 class="dropdown-header">Sélectionner une année :</h6>
                                <router-link v-for="month in months" :key="month.id" :to="{name:month.routeName, params:{year:month.year, key:keyRoute, id:idAccount}}" :class="{active : month.year==date}" tag="a" class="dropdown-item">{{month.year}}</router-link>
                            </div>
                        </div>&nbsp;

                        <div class="dropdown">
                            <button class="btn btn-outline-primary my-2 my-sm-0 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {{selectAccount}}
                            </button>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <h6 class="dropdown-header">Sélectionner un compte :</h6>
                                <router-link v-for="(account, index) in accounts" :key="index" :to="{name:'Account', params:{id: index, year:date, key:account.key}}" :class="{active : index==idAccount}"  tag="a" class="dropdown-item">{{account.name}}</router-link>
                            </div>
                        </div>
                        </ul>
                        <button class="btn btn-outline-primary my-2 my-sm-0" type="" @click.prevent="downloadCsv"><span class="fas fa-cloud-download-alt" aria-hidden="true"></span> CSV</button>
                            &nbsp;
                        <div class="my-2 my-lg-0">
                            <input class="form-control mr-sm-2" type="text" id="search" placeholder="Rechercher" v-model="search" @keyup="searchInTab">
                        </div>
                    </div>
                </template>
            </div>
        </nav>
    </div>
</template>

<script>
import moment,{ duration } from 'moment'
import axios from 'axios'

export default {
    props: ['hasSearch', 'keyRoute', 'date', 'searchinput', 'accounts', 'idAccount'],
    name: 'Header',
    data(){
        return{
            search: ''
        }
    },
    computed : {
        months:{
            get : function(){
                let currentYear = parseInt(moment().format('YYYY'))
                let year = [{year :currentYear-2, current:false, routeName:'History'}, {year :currentYear-1, current:false, routeName:'History'},{id:this.idAccount,year :currentYear, current:true, routeName:'Result'} ]
                
                return year;   
            }
        },
        selectAccount: {
            get : function(){
                let currentAccount = this.accounts[this.idAccount]["name"]
                return currentAccount;
            }
        },
    },
    methods: {
        searchInTab (e) {
            var vm = this
            if(e != null)
                if (e.keyCode === 10 || e.keyCode === 13) 
                    e.preventDefault();

            vm.$emit('searchInTab', vm.search)
        }, 
        downloadCsv (e){
            var vm = this
            vm.$emit('downloadCsv')
        }
    }
}
</script>
