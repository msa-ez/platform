<template>
    <div style="width: 90%;">
        <v-card flat>
            <v-card-title>
                <h2> {{$t('myPage.admin_usage_title')}}</h2>
            </v-card-title>
            <v-card-text style="text-align: start; align-items: center;">
                <v-row>
                    <div style="width: 175px;margin: 10px;" v-if="isFindComapny">
                        <v-select
                            v-model="selectedTenant"
                            :items="tenant"
                            item-text="name"
                            item-value="code"
                            @change="changeSelectedTenant"
                            outlined dense
                        ></v-select>
                    </div>
                    
                    <div style="width: 300px;" v-else>
                        <v-text-field
                            v-model="search"
                            variant="solo"
                            label="Please enter the email address you want to search for."
                            single-line
                            hide-details
                            :loading="loading"
                            @keydown.enter="searchUsage()"
                        ></v-text-field>
                    </div>

                    <div style="width: 200px; margin-top: 20px; margin-left: 10px;">
                        <v-checkbox v-model="isFindComapny" label="Search by tenant" dense></v-checkbox>
                    </div>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-text style="margin-top: 10px;">
                <div>
                    <v-row>
                        <div style="width: 175px;">
                            <v-select
                                v-model="selectedMonth"
                                :items="months"
                                item-text="label"
                                item-value="label"
                                :disabled="!inputValidation"
                                @change="changeSelectedMonth"
                                outlined dense
                            ></v-select>
                        </div>
                        <div style="width: 175px; margin-left: 30px;">
                            <v-menu v-model="start.menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="start.date"
                                        :disabled="!inputValidation"
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
                                        :disabled="!inputValidation"
                                        outlined
                                        dense
                                        v-bind="attrs" v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="end.date" no-title scrollable @input="updateSelectedEndDate"></v-date-picker>
                            </v-menu>
                        </div>    

                        <div style="width: 175px; position: absolute; right: 0;">
                            <v-btn flat @click="exportCSV()" small :disabled="!inputValidation">
                                <v-icon left> mdi-download </v-icon> Export as CSV
                            </v-btn>
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
                            no-data-text="The user's usage history does not exist or has not been entered."
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
import Papa from 'papaparse';

export default {
        name: 'admin-usage-page',
        mixins: [UsagePage],
        components: {},
        data() {
            return {
                 // admin
                isFindComapny: false,
                search : '',
                selectedTenant: null,

                tenant:[],
                usageData:[],
                loading: false,
                totalSize: 0,
                pagination: { page: 1, itemsPerPage: 50 },
                headers: [
                    {text: 'Type', sortable: false, value: 'serviceType'},
                    {text: 'ID', sortable: false, value: 'metadata'},
                    {text: 'Plan', sortable: false, align: 'end', value: 'measurement'},
                    {text: 'Timestamp', sortable: false, align: 'start', value: 'issuedTimeStamp'},
                ],
            }
        },
        async created(){
            this.loadTenant()
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
            basePath(){
                if(this.isFindComapny){
                    return `usages/perTenant/${this.selectedTenant}`
                }
                return `usages/perUser/${this.search}`
            },
            inputValidation(){
                if(this.isFindComapny){
                    if(!this.selectedTenant) return false;
                } else {
                    if(!this.search) return false;
                }
                return true;
            },
        },
        methods:{
            searchUsage(){
                if(this.search.includes('@')){
                    // email 검색.
                    this.loadFirstPage()
                } else {
                    // email 형식 오류 알림. 
                }
            },
            async loadTenant(){
                let list = await this.db.getObject(`usageTenantList`)
                if(list.Error){
                    alert(result.Error);
                } else {
                    this.tenant = list ? list : []
                    if(!this.selectedTenant) this.selectedValue = this.tenant[0] ? this.tenant[0].code : null
                }
            },
            async loadFirstPage(){
                var me = this
                me.loading = true;
                let dateObj = me.formatTimeToYearMonth(me.start.date)
                let totalDocumentsSnapshot = await me.storage.list(`${me.basePath}/${dateObj.yearMonth}/data` ,{snapshot: true})
                me.totalSize = totalDocumentsSnapshot.size

                let result = await me.storage.list(`${me.basePath}/${dateObj.yearMonth}/data`, {
                    sort: "desc", //desc 최신순 (default "asc")
                    orderBy: 'issuedTimeStamp',
                    size: me.pagination.itemsPerPage,
                    startAt: me.formatDateStringToTimeStamp(this.start.date, 'start'),
                    endAt: me.formatDateStringToTimeStamp(this.end.date, 'end') ,
                    startAfter: null,
                    endBefore: null,
                })
                if(result.Error){
                    alert(result.Error);
                } else {
                    me.usageData = result
                }
                me.loading = false;   
            },
            async loadRange(startTimeStamp, endTimeStamp){
                if(!this.inputValidation) return;

                this.loading = true;
                let result = null;
                const startDate = this.formatTimeToYearMonth(startTimeStamp);
                const endDate = this.formatTimeToYearMonth(endTimeStamp);

              
                if(startDate.yearMonth == endDate.yearMonth){
                    // equals  Range : startTimeStamp =< range  =< endTimeStamp
                    let totalDocumentsSnapshot = await this.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
                    result = await this.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
                    let firstRangeSnapshot = await this.storage.list(`${this.basePath}/${endDate.yearMonth}/data`, {
                        sort: "desc", //desc 최신순 (default "asc")
                        orderBy: 'issuedTimeStamp',
                        size: 0,
                        startAt: endTimeStamp,
                        endAt: null,
                        startAfter: null,
                        endBefore: null,
                        snapshot: true
                    })
                     let secondRangeSnapshot = await this.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
                    
                    let firstRange = await this.storage.list(`${this.basePath}/${endDate.yearMonth}/data`, {
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
                        secondRange = await this.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
                        result = await me.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
                        let firstRange = await this.storage.list(`${this.basePath}/${endDate.yearMonth}/data`, {
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
                            secondRange = await this.storage.list(`${this.basePath}/${startDate.yearMonth}/data`, {
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
           
            changeSelectedTenant(){
                this.usageData = []
                this.pagination.page = 1
                this.loadFirstPage()
            }, 

            async exportCSV() {
                var me = this
                if(!this.inputValidation) return;

                let result = []
                let startYearMonth  = this.formatTimeToYearMonth(this.start.date).yearMonth          // 202401
                let endYearMonth  = this.formatTimeToYearMonth(this.end.date).yearMonth              // 202402
                let startTimeStamp = this.formatDateStringToTimeStamp(this.start.date, 'start')      // 1706713200000
                let endTimeStamp = this.formatDateStringToTimeStamp(this.end.date, 'end')            // 1706713200000


                if(startYearMonth == endYearMonth){
                    result = await me.storage.list(`${this.basePath}/${startYearMonth}/data`, {
                                    sort: "desc", //desc 최신순 (default "asc")
                                    orderBy: 'issuedTimeStamp',
                                    size: null,
                                    startAt: null,
                                    endAt: null,
                                    startAfter: startTimeStamp,
                                    endBefore: endTimeStamp
                                })
                } else {
                    let firstRange = await this.storage.list(`${this.basePath}/${endYearMonth}/data`, {
                                            sort: "desc", //desc 최신순 (default "asc")
                                            orderBy: 'issuedTimeStamp',
                                            size: null,
                                            startAt: startTimeStamp,
                                            endAt: null,
                                            startAfter: null,
                                            endBefore: null,
                                        });
                    let secondRange = await this.storage.list(`${this.basePath}/${startYearMonth}/data`, {
                                            sort: "desc", //desc 최신순 (default "asc")
                                            orderBy: 'issuedTimeStamp',
                                            size: null,
                                            startAt: null,
                                            endAt: endTimeStamp,
                                            startAfter: null,
                                            endBefore: null,
                                        });

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
                    result = result.map(keyValue => {
                        const item = keyValue.value;
                        return this.stringifyObjectValues(item);
                    });
                    const csvData = Papa.unparse(result);

                    let date = startYearMonth == endYearMonth ? startYearMonth : `${startYearMonth}_${endYearMonth}`
                    let title = this.isFindComapny ? `${this.selectedTenant}_${date}` : `${this.search}_${date}`
                    this.downloadCsv(csvData, title);
                }
            },

            
        }
    }
</script>