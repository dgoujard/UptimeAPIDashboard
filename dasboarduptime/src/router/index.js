import Vue from 'vue'
import Router from 'vue-router'
import Result from '@/pages/Result.vue'
import Details from '@/pages/Details.vue'
import Login from '@/pages/Login.vue'
import Datatable from 'vue2-datatable-component'


Vue.use(Router, Datatable)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Result',
            component: Result
        },
        {
            path: '/details/:id',
            name: 'Details',
            component: Details,
            props: true,
        },
        {
            path: '/account/:id/:year',
            name: 'History',
            component:Result
        },
        {
            path: '/account/:id/:year',
            name: 'Account',
            component:Result
        }
    ]
})
