<template>
    <div class="table">
        <div class="container table-year">
            <div class="table-responsive">
                <table class="table-fixed table table-hover table-striped table-lg" id="data">
                    <thead class="table-header">
                        <tr>
                            <th scope="col" @click.prevent="sortBy('name')">Nom</th>
                            <th scope="col" @click.prevent="sortBy(0)">Dispo. globale</th>
                            <th scope="col" v-for="(month, index) in months" :key="month.id" @click.prevent="sortBy(index+1)">{{month}}</th>
                            <th scope="col">Plus longue indispo</th>
                            <th scope="col" @click.prevent="sortBy('timestampLogdown')">Durée</th>
                            <th scope="col" @click.prevent="sortBy('cumulSeconde')">Cumule</th>
                            <th scope="col"></th>
                        </tr>
                        <tr class="MoyenneHeaders" >
                            <th v-for="average in average" :key="average.id">{{average}}</th>
                        </tr>  
                    </thead>
                    <tbody id="results">
                        <tr v-for="(result, index) in data" :key="index" @dblclick="displayRow(index)" :class="{'not-visible':!result.isVisible}">
                            <td scope="row" class="name text-left">
                                
                                <p v-if="result.status==2 || result.status==0" class="success text-left">
                                    <span v-if="result.status==2" class="fa fa-check-circle" aria-hidden="true"></span>
                                    <strong><router-link :to="{name:'Details', 
                                        params:{
                                            id:result.id,
                                            from:$route,
                                            key:keyAccount,
                                            date:date,
                                            search:search,
                                            idAccount:idAccount,
                                            interval:custom_interval,
                                            daysSelected:daysSelected
                                        }
                                    }">
                                    <span class="libellename">{{result.name}}</span><span class="far fa-chart-bar pt-1 float-right" aria-hidden="true"></span></router-link></strong>
                                </p>
                                <p v-if="result.status==9" class="alert text-left">

                                    <span v-if="result.status==9" class="fa fa-exclamation-circle" aria-hidden="true"></span>
                                    <strong><router-link :to="{name:'Details', 
                                        params:{
                                            id:result.id,
                                            from:$route,
                                            key:keyAccount,
                                            date:date,
                                            search:search,
                                            idAccount:idAccount,
                                            interval:custom_interval,
                                            daysSelected:daysSelected
                                        }   
                                    }">
                                    <span class="libellename">{{result.name}}</span><span class="far fa-chart-bar pt-1 float-right" aria-hidden="true"></span></router-link></strong>
                                </p>
                                <p v-if="result.status==8" class="danger text-left">
                                    <span v-if="result.status==8" class="fa fa-times-circle" aria-hidden="true"></span>
                                    <strong><router-link :to="{name:'Details', 
                                        params:{
                                            id:result.id,
                                            from:$route,
                                            key:keyAccount,
                                            date:date,
                                            search:search,
                                            idAccount:idAccount,
                                            interval:custom_interval,
                                            daysSelected:daysSelected
                                        }
                                    }">
                                    <span class="libellename">{{result.name}}</span><span class="far fa-chart-bar pt-1 float-right" aria-hidden="true"></span></router-link></strong>
                                </p>
                            </td>
                            <td class="ranges" v-for="range in result.ranges " :key="range.id">
                                <p v-if="range == 0.000" class="secondary">nc</p>
                                <p v-else-if="range > 99.9 || range == 100.000" class="success">{{range | formatNumber}}</p>
                                <p v-else-if="range > 99.6" class="alert">{{range | formatNumber}}</p>
                                <p v-else-if="range < 99.6" class="danger">{{range | formatNumber}}</p>
                            </td>
                            <td class="logdownDate" v-for="logdown in result.longerLogDown " :key="logdown.id">
                                <p v-if="logdown.date != 0">{{logdown.date}}</p>
                            </td>
                            <td class="logdownDuration" v-for="logdown in result.longerLogDown " :key="logdown.id">
                                <p class="timestamp" hidden>{{logdown.timestamp}}</p>
                                {{logdown.duration}}
                            </td>
                            <td class="">
                                {{result.cumul}}
                            </td>
                            <td class="url">
                                <a tag="button" data-toggle="tooltip" data-placement="top" title="Voir le site"  class="btn btn-primary" target="_blank" :href="result.url"><span class="fas fa-external-link-alt" aria-hidden="true"></span></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</template>
<script>
export default {
    props: ['data', 'months', 'average', 'keyAccount', 'date', 'search', 'idAccount','custom_interval', 'daysSelected'],
    name : 'Table',
    data(){
        return{
            sortKey: '',
        }
    },
    created() {
        this.$nextTick(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
    },
    filters: {
        formatNumber (value) {
            var number = value.toFixed(3)
            return number.toString().replace('.', ',');
        }
    },
    methods: {
        sortBy: function(name) {
            let vm = this
            vm.$emit('sortBy', name)
        }, 
        displayRow: function(index){
            let vm = this
            vm.$emit('displayRow', index)
        }
    }
}
</script>