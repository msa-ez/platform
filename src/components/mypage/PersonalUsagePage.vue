<template>
    <div style="width: 90%;">
        <v-card flat>
            <v-card-title>
                <h2> {{$t('myPage.usage_title')}}</h2>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text style="margin-top: 10px;">
                <div>
                    <v-row class="ma-0 pa-0">
                        <div style="width: 175px;">
                            <v-select
                                v-model="selectedMonth"
                                :items="months"
                                item-text="label"
                                item-value="label"
                                @change="changeSelectedMonth"
                                outlined dense
                            ></v-select>
                        </div>
                        <div style="width: 175px; margin-left: 30px;">
                            <v-menu v-model="start.menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="start.date"
                                        outlined
                                        dense
                                        v-bind="attrs" v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="start.date" no-title scrollable @input="updateSelectedStartDate"></v-date-picker>
                            </v-menu>
                        </div>
                        <div style="margin: 8px;">to</div>
                        <div style="width: 175px;">
                            <v-menu v-model="end.menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="end.date"
                                        outlined
                                        dense
                                        v-bind="attrs" v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="end.date" no-title scrollable @input="updateSelectedEndDate"></v-date-picker>
                            </v-menu>
                        </div>    
                    </v-row>
                
                    <div>
                        <v-data-table
                            :headers="headers"
                            :items="displayedUsageData"
                            :items-per-page="pagination.itemsPerPage"
                            :pagination.sync="pagination"
                            :loading="loading"
                            hide-default-footer
                            no-data-text="No data available"
                            class="elevation-1"
                            loading-text="Loading... Please wait"
                        >
                            <template v-slot:item.serviceType="{ item }">
                                <div class="row-title">
                                    {{ formatServiceType(item.value.serviceType).title }}
                                </div>
                                <div class="row-detail">
                                    {{ formatServiceType(item.value.serviceType).detail }}
                                </div>
                            </template>
                            <template v-slot:item.metadata="{ item }">
                                <div class="row-title">
                                    {{ formatMetadata(item.value).title }}
                                </div>
                                <div class="row-detail">
                                    {{ formatMetadata(item.value).detail }}
                                </div>
                            </template>
                            <template v-slot:item.measurement="{ item }">
                                <div class="row-title">
                                    {{ item.value.plan }}
                                </div>
                                <div class="row-detail">
                                    {{ formatMeasurement(item.value) }}
                                </div>
                            </template>
                            <template v-slot:item.issuedTimeStamp="{ item }">
                                <div class="row-title">
                                    {{ formatDate(item.value.issuedTimeStamp) }}
                                </div>
                            </template>
                        </v-data-table>
                        <v-pagination v-model="pagination.page" :length="pages" @input="loadPage" />
                    </div>
                </div>
            </v-card-text>
        </v-card>
       
    </div>
</template>

<script>
import UsagePage from './UsagePage.vue';

export default {
        name: 'personal-usage-page',
        mixins: [UsagePage],
        components: {},
        data() {
            return {
                // personal
                usageData:[],
                search: '',
                loading: false,
                totalSize: 0,
                pagination: { page: 1, itemsPerPage: 50 },
                headers: [
                    {text: 'Type', sortable: false, value: 'serviceType'},
                    {text: 'ID', sortable: false, value: 'metadata'},
                    {text: 'Plan', sortable: false, align: 'end', value: 'measurement'},
                    {text: 'Timestamp', sortable: false, align: 'start', value: 'issuedTimeStamp'}
                ]
                
            }
        },
        computed:{
            pages(){
                return Math.ceil(this.totalSize / this.pagination.itemsPerPage);
            },
            displayedUsageData() {
                // 현재 페이지에 해당하는 데이터 계산
                const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
                const end = start + this.pagination.itemsPerPage;
                return this.usageData.slice(start, end);
            },
        },
        methods:{
            async loadInitPage(){
                this.loading = true;
                if(!this.userInfo.enrolledUserEmail) return;
                let dateObj = this.formatTimeToYearMonth(this.start.date)

                let totalDocumentsSnapshot = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${dateObj.yearMonth}/data`,{snapshot: true})
                this.totalSize = totalDocumentsSnapshot.size

                let result = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${dateObj.yearMonth}/data`, {
                    sort: "desc", //desc 최신순 (default "asc")
                    orderBy: 'issuedTimeStamp',
                    size: this.pagination.itemsPerPage,
                    startAt: this.formatDateStringToTimeStamp(this.start.date, 'start'),
                    endAt: this.formatDateStringToTimeStamp(this.end.date, 'end'),
                    startAfter: null,
                    endBefore: null,
                })
                if(result.Error){
                    //.. error 표시.
                    alert(result.Error);
                } else {
                    this.usageData = result
                }
                this.loading = false;    
           },
           async loadRange(startTimeStamp, endTimeStamp){
                this.loading = true;
                let result = null;
                const startDate = this.formatTimeToYearMonth(startTimeStamp);
                const endDate = this.formatTimeToYearMonth(endTimeStamp);
                
                if(startDate.yearMonth == endDate.yearMonth){
                    // equals  Range : startTimeStamp =< range  =< endTimeStamp
                    let totalDocumentsSnapshot = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                        sort: "desc", //desc 최신순 (default "asc")
                        orderBy: 'issuedTimeStamp',
                        size: 0,
                        startAt: startTimeStamp,
                        endAt: endTimeStamp,
                        startAfter: null,
                        endBefore: null,
                        snapshot: true
                    })
                    this.totalSize = totalDocumentsSnapshot.size
                    result = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                        sort: "desc", //desc 최신순 (default "asc")
                        orderBy: 'issuedTimeStamp',
                        size: this.pagination.itemsPerPage,
                        startAt: startTimeStamp,
                        endAt: endTimeStamp,
                        startAfter: null,
                        endBefore: null,
                    })
                } else {
                    let secondRange = [];
                    let firstRangeSnapshot = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${endDate.yearMonth}/data`, {
                        sort: "desc", //desc 최신순 (default "asc")
                        orderBy: 'issuedTimeStamp',
                        size: 0,
                        startAt: endTimeStamp,
                        endAt: null,
                        startAfter: null,
                        endBefore: null,
                        snapshot: true
                    })
                     let secondRangeSnapshot = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                        sort: "desc", //desc 최신순 (default "asc")
                        orderBy: 'issuedTimeStamp',
                        size: 0,
                        startAt: null,
                        endAt: startTimeStamp,
                        startAfter: null,
                        endBefore: null,
                        snapshot: true
                    })
                    this.totalSize = firstRangeSnapshot.size + secondRangeSnapshot.size
                    
                    let firstRange = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${endDate.yearMonth}/data`, {
                                sort: "desc", //desc 최신순 (default "asc")
                                orderBy: 'issuedTimeStamp',
                                size: this.pagination.itemsPerPage,
                                startAt: endTimeStamp,
                                endAt: null,
                                startAfter: null,
                                endBefore: null,
                            })
                    if(firstRange.length  < this.pagination.itemsPerPage){
                        let requestSize = this.pagination.itemsPerPage - firstRange.length
                        secondRange = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                                        sort: "desc", //desc 최신순 (default "asc")
                                        orderBy: 'issuedTimeStamp',
                                        size: requestSize,
                                        startAt: null,
                                        endAt: startTimeStamp,
                                        startAfter: null,
                                        endBefore: null,
                                    })
                    } else {
                        secondRange = []
                    }
                
                    if(firstRange.Error || secondRange.Error){
                        result = firstRange.Error ? firstRange : secondRange
                    } else {
                        if(!result) result = []
                        if(!firstRange) firstRange = []
                        if(!secondRange) secondRange = []

                        result = result.concat(firstRange).concat(secondRange);
                    }
                }
               
                if(result.Error){
                    alert(result.Error);
                } else {
                    this.usageData = result
                }
                this.pagination.page = 1
                this.loading = false;
           },
           async loadPage(page){
                var me = this
            
                let requestedMaxSize = me.pagination.itemsPerPage * (page) // 1: 3 * 1 = 3 / 2: 3*2 =6
                let currentLoadedDataNum = me.usageData.length
              

                if(!(me.totalSize == me.usageData.length) && currentLoadedDataNum < requestedMaxSize){
                    me.loading = true;
                    let requestedSize  = requestedMaxSize - currentLoadedDataNum
                    let currentLastestTimeStamp = me.usageData[currentLoadedDataNum-1].value.issuedTimeStamp
                    const startDate = this.formatTimeToYearMonth(this.start.date);
                    const endDate = this.formatTimeToYearMonth(currentLastestTimeStamp);
                    let result = null


                    if(startDate.yearMonth == endDate.yearMonth){
                        result = await me.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                                    sort: "desc", //desc 최신순 (default "asc")
                                    orderBy: 'issuedTimeStamp',
                                    size: requestedSize,
                                    startAt: null,
                                    endAt: null,
                                    startAfter: this.formatDateStringToTimeStamp(this.start.date),
                                    endBefore: currentLastestTimeStamp,
                                })
                    } else {
                        let secondRange = [];
                        let firstRange = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${endDate.yearMonth}/data`, {
                                        sort: "desc", //desc 최신순 (default "asc")
                                        orderBy: 'issuedTimeStamp',
                                        size: requestedSize,
                                        startAt: null,
                                        endAt: null,
                                        startAfter: currentLastestTimeStamp,
                                        endBefore: null,
                                      });

                        if(firstRange.length < requestedSize){
                            requestedSize = requestedSize - firstRange.length
                            secondRange = await this.storage.list(`/usages/perUser/${this.userInfo.email}/${startDate.yearMonth}/data`, {
                                            sort: "desc", //desc 최신순 (default "asc")
                                            orderBy: 'issuedTimeStamp',
                                            size: requestedSize,
                                            startAt: null,
                                            endAt: null,
                                            startAfter: null,
                                            endBefore: this.formatDateStringToTimeStamp(this.start.date),
                                        });
                        }
                                
                      
                        if(firstRange.Error || secondRange.Error ){
                            result = firstRange.Error ? firstRange : secondRange
                        } else {
                            if(!result) result = []
                            if(!firstRange) firstRange = []
                            if(!secondRange) secondRange = []

                            result = result.concat(firstRange).concat(secondRange);
                        }
                    }
                     
                    if(result.Error){
                        alert(result.Error);
                    } else {
                        me.usageData = me.usageData.concat(result);  
                    }
                    me.loading = false;
                } 
            },
            
        }
    }
</script>